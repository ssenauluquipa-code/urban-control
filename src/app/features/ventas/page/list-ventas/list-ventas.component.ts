import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ColDef } from "ag-grid-community";
import { ClienteVenta, IVenta } from "src/app/core/models/venta.model";
import { VentaService } from "src/app/core/services/venta.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ConfirmationService } from "src/app/core/services/confirmation.service";
import {
  ITableActionEvent,
  TableActionsEnum,
} from "src/app/shared/interfaces/table-actions.interface";
import { EAppModule } from "src/app/core/config/permissions.enum";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { ProjectStatusGlobalService } from "src/app/core/services/project-status-global.service";
import { finalize } from "rxjs";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { Router } from "@angular/router";
import { VentaPropietariosCellComponent } from "src/app/shared/components/atoms/venta-propietarios-cell/venta-propietarios-cell.component";
import { AnularVentaModalComponent } from "../anular-venta-modal.component";
import { VentaTipoPagoCellComponent } from "../../components/venta-tipo-pago-cell.component";
import { VentaTipoPagoFloatingFilterComponent } from "src/app/shared/components/organisms/venta-tipo-pago-floating-filter.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BadgeEstadoComponent } from "src/app/shared/components/atoms/badge-estado/badge-estado.component";

/** Listado de ventas del proyecto con acciones ver, editar y anular. */
@Component({
  selector: "app-list-ventas",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
  ],
  templateUrl: "./list-ventas.component.html",
  styleUrls: ["./list-ventas.component.scss"],
})
export class ListVentasComponent implements OnInit {
  // Inyecciones[cite: 21, 22]
  private ventaService = inject(VentaService);
  private globalContext = inject(ProjectStatusGlobalService);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);

  // Estado
  public tableActionEnum = TableActionsEnum;
  public readonly EAppModule = EAppModule;
  public ventas: IVenta[] = [];
  public loading = false;
  public proyectoId: string | null = null;

  // Filtros Reactivos
  public termControl = new FormControl<string | null>(null);
  public manzanaControl = new FormControl<string | null>(null);

  // Definición de columnas para la tabla de ventas
  /* public columnDefs: ColDef[] = [
    {
      field: 'codigoVenta',
      headerName: 'Código',
      width: 120,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'clienteNombre',
      headerName: 'Cliente',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'nroDocumento',
      headerName: 'Documento',
      width: 140,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'loteCodigo',
      headerName: 'Lote',
      width: 100,
      suppressHeaderMenuButton: true
    },
    {
      field: 'proyectoNombre',
      headerName: 'Proyecto',
      flex: 1,
      minWidth: 150,
      suppressHeaderMenuButton: true
    },
    {
      field: 'fechaVenta',
      headerName: 'Fecha',
      width: 120,
      suppressHeaderMenuButton: true
    },
    {
      field: 'precioTotal',
      headerName: 'Precio Total',
      width: 140,
      valueFormatter: (params) => this.formatCurrency(params.value),
      suppressHeaderMenuButton: true
    },
{
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      cellRenderer: (params: { value: EEstadoVenta }) => this.getEstadoBadge(params.value),
      suppressHeaderMenuButton: true
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 130,
      cellRenderer: BadgeEstadoComponent,
      filter: true,
      floatingFilter: true,
      floatingFilterComponent: StatusFloatingFilterComponent,
      floatingFilterComponentParams: {
        onStatusChange: (status: boolean | undefined) => this.onStatusFilterChanged(status)
      },
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    }
  ]; */

  columnDefs: ColDef[] = [
    {
      field: "nroVenta",
      headerName: "Nro. Venta",
      width: 120,
      cellStyle: { fontWeight: "bold" },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      headerName: "Ubicación",
      width: 180,
      valueGetter: (params) => {
        return params.data
          ? `Mza ${params.data.manzana} - Lt ${params.data.numeroLote}`
          : "";
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "clientes",
      headerName: "Propietario(s)",
      flex: 1,
      minWidth: 250,
      cellRenderer: VentaPropietariosCellComponent,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      // Getter para que el filtro de texto funcione con la lista de clientes
      valueGetter: (params) => {
        if (!params.data?.clientes) return '';
        return params.data.clientes.map((c: ClienteVenta) => c.nombre).join(', ');
      }
    },
    {
      headerName: "Fecha",
      width: 140,
      valueGetter: (params) => {
        if (!params.data?.fechaVenta) return '';
        const date = new Date(params.data.fechaVenta);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
    },
    {
      field: "montoTotal",
      headerName: "Total",
      width: 130,
      valueFormatter: (p) =>
        p.data ? `${p.data.moneda} ${p.value.toLocaleString()}` : "",
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
    },
    {
      colId: "tipoPago",
      field: "tipoPago",
      headerName: "Tipo Pago",
      width: 150,
      cellRenderer: VentaTipoPagoCellComponent,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: VentaTipoPagoFloatingFilterComponent,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'estado',
      headerName: "Estado",
      width: 150,
      cellRenderer: BadgeEstadoComponent,
      filter: 'agTextColumnFilter',
      floatingFilter: false,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
  ];

  ngOnInit(): void {
    // 1. Escuchar Proyecto Global
    this.globalContext.selectedProjectId$.subscribe((projectId) => {
      this.proyectoId = projectId || null;
      this.manzanaControl.setValue(null, { emitEvent: false }); // Reset local

      if (projectId) {
        this.loadVentas();
      } else {
        this.ventas = [];
        this.cdr.detectChanges();
      }
    });
    // 2. Escuchar cambios en filtros (Termino y Manzana)
    /* 
    merge(
      this.termControl.valueChanges.pipe(distinctUntilChanged()),
      this.manzanaControl.valueChanges.pipe(distinctUntilChanged()),
    )
      .pipe(debounceTime(400))
      .subscribe(() => {
        this.loadVentas();
      });
    */
  }

  /** Consulta ventas del proyecto seleccionado. */
  loadVentas(): void {
    if (!this.proyectoId) return;

    this.loading = true;

    // En local cargamos todo el proyecto al inicio (parámetros undefined)
    this.ventaService
      .listarVentas(undefined, undefined)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (data) => {
          this.ventas = data.map((venta) => ({
            ...venta,
            isActive:
              (venta as IVenta & { estado?: string }).estado !== "ANULADA",
          }));
        },
        error: () =>
          this.notification.error("Error al cargar el listado de ventas"),
      });
  }

  /** Enruta acciones de fila: anular, editar, ver o eliminar. */
  onTableAction(event: ITableActionEvent<IVenta>): void {
    if (event.action === TableActionsEnum.ANULAR && event.row?.ventaId) {
      const modalRef = this.modalService.open(AnularVentaModalComponent, {
        size: "md",
        backdrop: "static",
        keyboard: false,
      });

      modalRef.componentInstance.ventaId = event.row.ventaId;
      modalRef.componentInstance.nroVenta = event.row.nroVenta;

      modalRef.result
        .then((result) => {
          if (result) {
            this.loadVentas();
          }
        })
        .catch(() => undefined);
      return;
    }

    /* if (event.action === TableActionsEnum.EDIT && event.row?.ventaId) {
      this.router.navigate(["/ventas/editar", event.row.ventaId]);
      return;
    } */

    if (event.action === TableActionsEnum.VIEW && event.row?.ventaId) {
      this.router.navigate(["/ventas/detail", event.row.ventaId]);
    }
    if (event.action === TableActionsEnum.DELETE && event.row?.ventaId && event.row?.estado === "ANULADA") {
      this.confirmarEliminar(event.row);
    }
  }

  /** Elimina físicamente solo ventas ya anuladas. */
  private confirmarEliminar(venta: IVenta): void {
    if (venta.estado !== "ANULADA") {
      this.notification.warning("Solo se pueden eliminar ventas que se encuentren anuladas.");
      return;
    }
    const request$ = this.ventaService.eliminarVenta(venta.ventaId);
    this.confirmation.confirmDelete("Venta", `#${venta.nroVenta}`, request$, true) // true porque es femenino (esta venta, eliminada)
      .subscribe(success => {
        if (success) {
          this.loadVentas();
        }
      });
  }

  /** Navega al formulario de registro de venta. */
  onAddNew(): void {
    this.router.navigate(["/ventas/register"]);
  }
}
