import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize } from "rxjs";
import { ColDef } from "ag-grid-community";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

// Modelos e Interfaces
import { IVenta } from "src/app/core/models/venta.model";
import { EAppModule } from "src/app/core/config/permissions.enum";
import { ITableActionEvent, TableActionsEnum } from "src/app/shared/interfaces/table-actions.interface";

// Servicios
import { VentaService } from "src/app/core/services/venta.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ConfirmationService } from "src/app/core/services/confirmation.service";
import { ProjectStatusGlobalService } from "src/app/core/services/project-status-global.service";

// Componentes Compartidos
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { VentaPropietariosCellComponent } from "src/app/shared/components/atoms/venta-propietarios-cell/venta-propietarios-cell.component";

// Modales
import { AnularVentaModalComponent } from "../anular-venta-modal.component";
import { VentaTipoPagoCellComponent } from "../../components/venta-tipo-pago-cell.component";
import { VentaTipoPagoFloatingFilterComponent } from "src/app/shared/components/organisms/venta-tipo-pago-floating-filter.component";

@Component({
  selector: "app-list-ventas",
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PageContainerComponent
  ],
  templateUrl: "./list-ventas.component.html",
})
export class ListVentasComponent implements OnInit {
  // Inyección moderna de servicios usando inject()
  private readonly ventaService = inject(VentaService);
  private readonly globalContext = inject(ProjectStatusGlobalService);
  private readonly notification = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);
  private readonly destroyRef = inject(DestroyRef);

  // Enums expuestos para el template HTML
  public readonly EAppModule = EAppModule;
  public readonly tableActionEnum = TableActionsEnum;

  // Convertimos el signal a observable en el contexto válido
  private readonly projectId$ = toObservable(this.globalContext.currentProjectId);

  // Estado del Componente
  public ventas: IVenta[] = [];
  public columnDefs: ColDef[] = [];
  public loading: boolean = false;
  public proyectoId: string | null = null;

  ngOnInit(): void {
    this.loadColumnDefs();

    // ⚡ Escuchamos reactivamente el Observable del proyecto global
    this.projectId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((projectId: string | null) => {
        this.proyectoId = projectId;
        this.loadVentas(); // El interceptor inyectará automáticamente el header X-Project-Id
      });
  }

  /**
   * Carga el listado general de ventas.
   * La segmentación por proyecto se maneja a nivel de red gracias al projectInterceptor
   */
  public loadVentas(): void {
    if (!this.proyectoId) {
      this.ventas = [];
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;

    // 🚀 Invocación limpia y desacoplada del parámetro proyectoId
    this.ventaService
      .listarVentas()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: IVenta[]) => {
          this.ventas = data;
        },
        error: () => {
          this.notification.error("Error al cargar el listado de ventas");
        },
      });
  }

  /**
   * Gestor centralizado de eventos y acciones sobre las filas de la tabla
   */
  public onTableAction(event: ITableActionEvent<IVenta>): void {
    if (!event.row) return;

    switch (event.action) {
      case TableActionsEnum.ANULAR:
        if (event.row.ventaId) {
          const modalRef = this.modalService.open(AnularVentaModalComponent, {
            size: "md",
            backdrop: "static",
            keyboard: false,
          });

          modalRef.componentInstance.ventaId = event.row.ventaId;
          modalRef.componentInstance.nroVenta = event.row.nroVenta;

          modalRef.result
            .then((result) => {
              if (result) this.loadVentas();
            })
            .catch(() => undefined);
        }
        break;

      case TableActionsEnum.VIEW:
        if (event.row.ventaId) {
          this.router.navigate(["/ventas/detail", event.row.ventaId]);
        }
        break;

      case TableActionsEnum.DELETE:
        if (event.row.ventaId && event.row.estado === "ANULADA") {
          this.confirmarEliminar(event.row);
        } else {
          this.notification.warning("Solo se pueden eliminar físicamente ventas que se encuentren ANULADAS.");
        }
        break;

      default:
        console.warn("Acción no reconocida en listado de ventas:", event.action);
        break;
    }
  }

  /**
   * Ejecuta la confirmación visual y posterior borrado físico de la venta
   */
  private confirmarEliminar(venta: IVenta): void {
    if (venta.estado !== "ANULADA") {
      this.notification.warning("Solo se pueden eliminar ventas que se encuentren anuladas.");
      return;
    }

    const request$ = this.ventaService.eliminarVenta(venta.ventaId);
    this.confirmation
      .confirmDelete("Venta", `#${venta.nroVenta}`, request$, true)
      .subscribe((success) => {
        if (success) this.loadVentas();
      });
  }

  /**
   * Redirección programática al formulario de altas
   */
  public onAddNew(): void {
    this.router.navigate(["/ventas/register"]);
  }

  /**
   * Estructura fuertemente tipada para las columnas ag-grid del listado
   */
  private loadColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: "Nro. Venta",
        field: "nroVenta",
        filter: "agTextColumnFilter",
        flex: 1,
      },
      {
        headerName: "Clientes / Propietarios",
        field: "propietarios",
        cellRenderer: VentaPropietariosCellComponent,
        flex: 2.5,
      },
      {
        headerName: "Fecha Venta",
        field: "fechaVenta",
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : ""),
        flex: 1,
      },
      {
        headerName: "Precio Total",
        field: "montoTotal",
        valueFormatter: (params) => (params.value ? `Bs. ${params.value.toLocaleString()}` : "Bs. 0"),
        flex: 1,
      },
      {
        headerName: "Saldo Pendiente",
        field: "saldoPendiente",
        valueFormatter: (params) => (params.value ? `Bs. ${params.value.toLocaleString()}` : "Bs. 0"),
        flex: 1,
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
        headerName: "Estado",
        field: "estado",
        filter: "agTextColumnFilter",
        flex: 1,
      },
    ];
  }
}