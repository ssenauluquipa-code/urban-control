import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize } from "rxjs";
import { ColDef } from "ag-grid-community";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

// Modelos e Interfaces
import { IVenta, TipoPago } from "src/app/core/models/venta.model";
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
import { BadgeEstadoComponent } from "src/app/shared/components/atoms/badge-estado/badge-estado.component";
import { StatusFloatingFilterVentasComponent } from "src/app/shared/components/organisms/status-floating-filter-ventas.component";
import { PdfViewerUtil } from "src/app/core/utils/pdf-viewer.util";
import { ExportPdfService } from "src/app/core/services/export-pdf.service";
import { ExportExcelService } from "src/app/core/services/export-excel.service";
import { UploadContratoMultipleComponent } from "../../components/upload-contrato-multiple/upload-contrato-multiple.component";

@Component({
  selector: "app-list-ventas",
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PageContainerComponent,
    UploadContratoMultipleComponent,
  ],
  templateUrl: "./list-ventas.component.html",
})
export class ListVentasComponent implements OnInit {
  @ViewChild(DataTableComponent) private dataTable?: DataTableComponent<IVenta>;

  // Inyección moderna de servicios usando inject()
  private readonly ventaService = inject(VentaService);
  private readonly globalContext = inject(ProjectStatusGlobalService);
  private readonly notification = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly modalService = inject(NgbModal);
  private readonly destroyRef = inject(DestroyRef);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

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

    const venta = event.row;

    const clienteIds = venta.clientes[0].id  || '';

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

      case TableActionsEnum.PAGO:
      const ventaData = event.row;
      const titular = ventaData.clientes?.find((c: any) => c.rol === 'TITULAR') || ventaData.clientes?.[0];
      const clienteId = titular?.id;
      // 2. 🌟 LIMPIAR EL NOMBRE: Si viene "Juan Pablo Seña - CI 125...", nos quedamos solo con "Juan Pablo Seña"
      let nombreCliente = titular?.nombre || 'Titular de la Venta';
      if (nombreCliente.includes(' - ')) {
        nombreCliente = nombreCliente.split(' - ')[0].trim();
      }

      if (!ventaData.ventaId || !clienteId) {
        this.notification.warning('No se encontraron los datos necesarios para procesar el pago.');
        return;
      }

      // 2. Redireccionar a la misma ruta de pagos con la estructura exacta que espera el formulario
      this.router.navigate(['/pagos/register'], {
        state: {
          ventaId: ventaData.ventaId,
          nroVenta: ventaData.nroVenta,
          moneda: ventaData.moneda,
          tipoCambio: ventaData.tipoCambio,
          montoTotal: ventaData.montoTotal,
          saldoPendiente: ventaData.saldoPendiente,
          nombreCompletoCliente: nombreCliente,
          clienteId: clienteId,
          esContadoDirecto: ventaData.tipoPago === 'CONTADO' // Dinámico según el tipo de pago
        }
      });
      break;
      // 🚀 IMPLEMENTACIÓN NUEVA: PLAN DE CUENTAS
      case TableActionsEnum.PLAN_CUENTAS:
        if (!clienteIds) {
          this.notification.warning('No se pudo identificar un cliente asociado a esta venta.');
          return;
        }
        this.verPlanCuentasPdf(venta.ventaId, clienteIds);
        break;

      // 🚀 IMPLEMENTACIÓN NUEVA: INFORME DE DEVOLUCIÓN
      case TableActionsEnum.DEVOLUCION:
        if (!clienteIds) {
          this.notification.warning('No se pudo identificar un cliente asociado a esta venta.');
          return;
        }
        this.verDevolucionPdf(venta.ventaId, clienteIds);
        break;

      // 🚀 IMPLEMENTACIÓN NUEVA: SUBIR CONTRATOS
      case TableActionsEnum.CONTRATOS:
        if (event.row.ventaId) {
          const modalRef = this.modalService.open(UploadContratoMultipleComponent, {
            size: "lg",
            backdrop: "static",
            keyboard: false,
          });
          modalRef.componentInstance.ventaId = event.row.ventaId;
          modalRef.componentInstance.nroVenta = event.row.nroVenta;
          modalRef.result
            .then((updated) => {
              if (updated) this.loadVentas();
            })
            .catch(() => undefined);
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

  public exportarPDF(): void {
    let dataToExport = this.ventas;
    if (this.dataTable?.gridApi) {
      const filtered: IVenta[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportPdfService.exportAsPdf('Gestión de Ventas', this.columnDefs, dataToExport);
  }

  public exportarExcel(): void {
    let dataToExport = this.ventas;
    if (this.dataTable?.gridApi) {
      const filtered: IVenta[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportExcelService.exportAsExcel('Gestión de Ventas', this.columnDefs, dataToExport);
  }

  /**
   * Llama al servicio core y abre la vista previa del Plan de Cuentas
   */
  private verPlanCuentasPdf(ventaId: string, clienteId: string): void {
    this.loading = true;
    this.ventaService.descargarPlanCuentas(ventaId, clienteId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (blob: Blob) => {
          PdfViewerUtil.preview(blob);
          this.notification.success('Plan de cuentas generado correctamente.');
        },
        error: (err) => {
          // Captura el error 409 o 404 del Swagger de manera semántica
          if (err.status === 409) {
            this.notification.warning('La venta se encuentra anulada o no tiene organización asociada.');
          } else {
            this.notification.error('No se pudo generar el reporte del plan de cuentas.');
          }
        }
      });
  }

  /**
   * Llama al servicio core y abre la vista previa del Informe de Devolución
   */
  private verDevolucionPdf(ventaId: string, clienteId: string): void {
    this.loading = true;
    this.ventaService.descargarInformeDevolucion(ventaId, clienteId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (blob: Blob) => {
          PdfViewerUtil.preview(blob);
          this.notification.success('Informe de devolución generado correctamente.');
        },
        error: (err) => {
          // Captura la restricción del back: la venta DEBE estar anulada
          if (err.status === 409) {
            this.notification.warning('No se puede generar este informe porque la venta NO está anulada.');
          } else {
            this.notification.error('No se pudo generar el informe de devolución.');
          }
        }
      });
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
        minWidth: 120,
      },
      {
        headerName: "Clientes / Propietarios",
        field: "propietarios",
        cellRenderer: VentaPropietariosCellComponent,
        valueGetter: (params) => {
          const clientes = params.data?.clientes || [];
          if (clientes.length === 0) return "";
          const titular = clientes.find((c: any) => c.rol === 'TITULAR') || clientes[0];
          const cotitulares = clientes.filter((c: any) => c.id !== titular.id);
          if (cotitulares.length === 0) {
            return titular.nombre;
          }
          return `${titular.nombre} (+${cotitulares.length}: ${cotitulares.map((c: any) => c.nombre).join(', ')})`;
        },
        flex: 2.5,
        minWidth: 220,
      },
      {
        headerName: "Fecha Venta",
        field: "fechaVenta",
        valueFormatter: (params) => (params.value ? new Date(params.value).toLocaleDateString() : ""),
        flex: 1,
        minWidth: 130,
      },
      {
        headerName: "Precio Total",
        field: "montoTotal",
        valueFormatter: (params) => {
          if (params.value === undefined || params.value === null) return "0.00";
          // 🪙 Obtenemos la moneda de la fila, por defecto 'BS' si no viniera
          const moneda = params.data?.moneda || "BS";
          return `${moneda} ${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
        flex: 1,
        minWidth: 140,
      },
      {
        headerName: "Saldo Pendiente",
        field: "saldoPendiente",
        valueFormatter: (params) => {
          if (params.value === undefined || params.value === null) return "0.00";
          // 🪙 Evaluamos de igual forma la moneda asignada al contrato de venta
          const moneda = params.data?.moneda || "BS";
          return `${moneda} ${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        },
        flex: 1,
        minWidth: 150,
      },
      {
        colId: "tipoPago",
        field: "tipoPago",
        headerName: "Tipo Pago",
        width: 130,
        minWidth: 120,
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
        width: 115,
        minWidth: 110,
        cellRenderer: BadgeEstadoComponent,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: StatusFloatingFilterVentasComponent,
        suppressFloatingFilterButton: true,
        suppressHeaderMenuButton: true,
        suppressHeaderFilterButton: true,
      },
    ];
  }
}
