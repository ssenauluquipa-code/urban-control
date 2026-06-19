import { ChangeDetectorRef, Component, effect, inject, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ColDef, CellClassParams } from "ag-grid-community";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { finalize } from "rxjs";

import { IPagos } from "src/app/core/models/pagos.model";
import { PagosService } from "src/app/core/services/pagos.service";
import { VentaService } from "src/app/core/services/venta.service";
import { AuthService } from "src/app/core/services/auth.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ConfirmationService } from "src/app/core/services/confirmation.service";
import { ProjectStatusGlobalService } from "src/app/core/services/project-status-global.service";
import { convertirNumeroALetras } from "src/app/core/utils/numero-a-letras.util";
import { EAppModule } from "src/app/core/config/permissions.enum";
import {
  ITableActionEvent,
  TableActionsEnum,
} from "src/app/shared/interfaces/table-actions.interface";

import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { BadgeEstadoComponent } from "src/app/shared/components/atoms/badge-estado/badge-estado.component";
import { AnularPagoModalComponent } from "./anular-pago-modal.component";
import { PagoIconCellComponent } from "../components/pago-icon-cell.component";
import { UploadComprobanteMultipleComponent } from "../components/upload-comprobante-multiple/upload-comprobante-multiple.component";
import { StatusFloatingFilterPagosComponent } from "src/app/shared/components/organisms/status-floating-filter-pagos.component";
import {
  ModalComprobantePagoComponent,
  IReciboPagoData,
} from "../components/modal-comprobante-pago/modal-comprobante-pago.component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { OrganizationService } from "src/app/core/services/configuracion/organization.service";
import { ReciboPdfService } from "src/app/core/services/recibo-pdf.service";
import { forkJoin } from "rxjs";
import { ExportPdfService } from "src/app/core/services/export-pdf.service";
import { ExportExcelService } from "src/app/core/services/export-excel.service";
import { CurrencyCalculationService } from "src/app/core/services/finance/currency-calculation.service";
import { Moneda } from "src/app/core/models/reserva.model";


@Component({
  selector: "app-list-pagos",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
  ],
  template: `
    <app-page-container
      title="Gestión de Pagos"
      [permissionScope]="EAppModule.PAGOS"
      [showNew]="true"
      [showOptions]="true"
      (AddNew)="onAddNew()"
      (MenuExportPDF)="exportarPDF()"
      (MenuExportExcel)="exportarExcel()"
    >
      <app-data-table
        [module]="EAppModule.PAGOS"
        [rowData]="pagos"
        [columnDefs]="columnDefs"
        [loading]="loading"
        [showCreate]="false"
        [actions]="[
          tableActionEnum.VIEW,
          tableActionEnum.IMPRIMIR_RECIBO,
          tableActionEnum.ANULAR,
          tableActionEnum.COMPROBANTE,
        ]"
        (actionClicked)="onTableAction($event)"
      >
      </app-data-table>
    </app-page-container>
  `,
  styles: ``,
})
export class ListPagosComponent {
  @ViewChild(DataTableComponent) private dataTable?: DataTableComponent<IPagos>;

  private pagosService = inject(PagosService);
  private ventaService = inject(VentaService);
  private authService = inject(AuthService);
  private globalContext = inject(ProjectStatusGlobalService);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);
  private breakpointObserver = inject(BreakpointObserver);
  private organizationService = inject(OrganizationService);
  private reciboPdfService = inject(ReciboPdfService);
  private currencyService = inject(CurrencyCalculationService);


  public tableActionEnum = TableActionsEnum;
  public readonly EAppModule = EAppModule;
  public pagos: IPagos[] = [];
  public loading = false;
  public proyectoId: string | null = null;

  columnDefs: ColDef[] = [
    {
      field: "fechaPago",
      headerName: "Fecha Pago",
      width: 140,
      minWidth: 130,
      valueGetter: (params) => {
        if (!params.data?.fechaPago) return "";
        const date = new Date(params.data.fechaPago);
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
      },
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
      sortable: true,
    },
    {
      field: "codigoPago",
      headerName: "Código",
      width: 110,
      minWidth: 100,
      cellStyle: { fontWeight: "bold" },
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "ventaId",
      headerName: "Ref.Venta",
      width: 95,
      minWidth: 100,
      filter: "agTextColumnFilter",
      floatingFilter: false,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      cellRenderer: PagoIconCellComponent,
      cellStyle: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      },
    },
    {
      field: "monto",
      headerName: "Monto",
      width: 110,
      minWidth: 95,
      cellStyle: {
        display: "flex",
        "justify-content": "flex-end",
        "align-items": "center",
      },
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
    },
    {
      field: "montoRecibido",
      headerName: "Recibido",
      width: 130,
      minWidth: 120,
      valueFormatter: (p) =>
        p.data ? `${p.data.monedaRecibida} ${p.value.toLocaleString()}` : "",
      cellStyle: (params: CellClassParams<IPagos>) => {
        const style: Record<string, string> = {
          display: "flex",
          "justify-content": "flex-end",
          "align-items": "center",
        };
        if (params.data) {
          if (params.data.montoRecibido < params.data.monto) {
            style["color"] = "#e67e22"; // Naranja / Alerta de Pago parcial
            style["fontWeight"] = "bold";
          } else {
            style["color"] = "#2ecc71"; // Verde / Pago completo
            style["fontWeight"] = "bold";
          }
        }
        return style;
      },
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
    },
    {
      field: "monedaRecibida",
      headerName: "Moneda recibida",
      width: 100,
      minWidth: 95,
      wrapText: true,
      autoHeaderHeight: true,
      filter: "agTextColumnFilter",
      floatingFilter: false,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "metodo",
      headerName: "Método",
      width: 105,
      minWidth: 105,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "observaciones",
      headerName: "Observaciones",
      minWidth: 200,
      flex: 1,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "nombreAsesor",
      headerName: "Vendedor",
      width: 150,
      minWidth: 150,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 115,
      minWidth: 110,
      cellRenderer: BadgeEstadoComponent,
      valueGetter: (params) => params.data?.estado || "Sin Estado",
      valueFormatter: (params) => params.value ? String(params.value) : "Sin Estado",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      floatingFilterComponent: StatusFloatingFilterPagosComponent,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    /* {
      field: "cantidadComprobantes",
      headerName: "Docs",
      width: 90,
      cellRenderer: (params: ICellRendererParams<IPagos>) => {
        const val = params.data?.cantidadComprobantes ?? 0;
        return val > 0
          ? `<span class="text-primary" style="font-weight: 600; display: flex; align-items: center; gap: 4px;">📎 ${val}</span>`
          : '<span class="text-muted">-</span>';
      },
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    }, */
  ];

  constructor() {
    /**
     * 🚀 EFECTO REACTIVO DE ANGULAR:
     * Escucha el Signal global del proyecto seleccionado de forma automática.
     * Tipa estrictamente el valor como string | null (Cero tipos any implícitos).
     */
    effect(() => {
      const currentId: string | null = this.globalContext.currentProjectId();
      this.proyectoId = currentId;

      if (currentId) {
        this.loadPagos();
      } else {
        this.pagos = [];
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Abre el modal para cargar/comprobar comprobantes de un pago.
   */
  abrirCargaComprobantes(pago: IPagos): void {
    const modalRef = this.modalService.open(
      UploadComprobanteMultipleComponent,
      {
        size: "lg",
        backdrop: "static",
        keyboard: false,
      },
    );
    modalRef.componentInstance.pagoId = pago.pagoId;
    modalRef.componentInstance.codigoPago = pago.codigoPago;
    modalRef.result
      .then(() => {
        if (this.proyectoId) this.loadPagos();
      })
      .catch(() => {
        // Modal cerrado sin acción
      });
  }

  loadPagos(): void {
    this.loading = true;

    this.pagosService
      .listarPagos()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (data) => {
          this.pagos = data;
        },
        error: () =>
          this.notification.error("Error al cargar el listado de pagos"),
      });
  }

  onTableAction(event: ITableActionEvent<IPagos>): void {
    if (event.action === TableActionsEnum.ANULAR && event.row?.pagoId) {
      const modalRef = this.modalService.open(AnularPagoModalComponent, {
        size: "md",
        backdrop: "static",
        keyboard: false,
      });

      modalRef.componentInstance.pagoId = event.row.pagoId;
      modalRef.componentInstance.codigoPago = event.row.codigoPago;

      modalRef.result
        .then((result) => {
          if (result && this.proyectoId) {
            this.loadPagos();
          }
        })
        .catch(() => undefined);
      return;
    }

    if (event.action === TableActionsEnum.VIEW && event.row?.pagoId) {
      this.router.navigate(["/pagos/detail", event.row.pagoId]);
    }
    if (event.action === TableActionsEnum.COMPROBANTE && event.row?.pagoId) {
      this.abrirCargaComprobantes(event.row);
    }

    if (
      event.action === TableActionsEnum.IMPRIMIR_RECIBO &&
      event.row?.pagoId
    ) {
      this.imprimirReciboPago(event.row.pagoId, event.row.ventaId);
    }
  }

  onAddNew(): void {
    this.router.navigate(["/pagos/register"]);
  }

  public exportarPDF(): void {
    let dataToExport = this.pagos;
    if (this.dataTable?.gridApi) {
      const filtered: IPagos[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportPdfService.exportAsPdf('Gestión de Pagos', this.columnDefs, dataToExport);
  }

  public exportarExcel(): void {
    let dataToExport = this.pagos;
    if (this.dataTable?.gridApi) {
      const filtered: IPagos[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportExcelService.exportAsExcel('Gestión de Pagos', this.columnDefs, dataToExport);
  }

  /**
   * Imprime el recibo de un pago existente.
   * Combina datos del pago, venta y saldo para generar el recibo completo.
   * Calcula los montos históricos (a cuenta y saldo) tal como estaban en el momento del pago.
   */
  private imprimirReciboPago(pagoId: string, ventaId: string): void {
    this.loading = true;

    forkJoin({
      pago: this.pagosService.obtenerPagoPorId(pagoId),
      venta: this.ventaService.obtenerVentaPorId(ventaId),
      todosLosPagos: this.pagosService.listarPagos({
        ventaId,
        estado: "ACTIVO",
      }),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ pago, venta, todosLosPagos }) => {
          const montoPagoActual = Number(pago.montoRecibido ?? pago.monto);
          const montoTotalVenta = Number(venta.montoTotal);

          // 1. El recibo original muestra el cliente principal, no todos los clientes de la venta.
          const nombreCliente = this.limpiarNombreCliente(
            venta.clientes?.[0]?.nombre || "Cliente General",
          );

          // 2. Mantener el mismo concepto que se genera al registrar el pago.
          const concepto =
            `Pago de lote por concepto de: ${montoTotalVenta} ${venta.moneda || ""}. ${pago.observaciones || ""}`.trim();

          // 3. Calcular saldo histórico del momento del pago.
          // A cuenta en el recibo original es el pago actual, no el acumulado.
          const pagosDeLaVenta = this.obtenerPagosUnicosPorVenta(
            [...this.pagos, ...todosLosPagos, pago],
            ventaId,
          );

          const pagosOrdenados = pagosDeLaVenta.sort((a, b) => {
            const fechaDiff =
              new Date(a.fechaPago).getTime() - new Date(b.fechaPago).getTime();
            if (fechaDiff !== 0) return fechaDiff;
            return Number(a.codigoPago) - Number(b.codigoPago);
          });

          const indicePagoActual = pagosOrdenados.findIndex(
            (p) => p.pagoId === pagoId,
          );
          const pagosAnteriores =
            indicePagoActual > 0
              ? pagosOrdenados.slice(0, indicePagoActual)
              : [];
          const totalPagadoAntes = pagosAnteriores.reduce(
            (sum: number, p: IPagos) =>
              sum + Number(p.monto),
            0,
          );
          const saldoDespuesDelPagoContrato = Math.max(
            montoTotalVenta - totalPagadoAntes - Number(pago.monto),
            0,
          );

          const tipoCambio = pago.tipoCambio || 1;
          const contratoMoneda = venta.moneda as Moneda;
          const pagoMoneda = pago.monedaRecibida as Moneda;

          const totalConvertido = this.currencyService.convertirMonto(
            montoTotalVenta,
            contratoMoneda,
            pagoMoneda,
            tipoCambio,
          );

          const saldoConvertido = this.currencyService.convertirMonto(
            saldoDespuesDelPagoContrato,
            contratoMoneda,
            pagoMoneda,
            tipoCambio,
          );

          // 4. Convertir monto a letras
          const montoEnLetras = convertirNumeroALetras(
            montoPagoActual,
            pago.monedaRecibida,
          );

          // 5. Obtener nombre del emisor (usuario actual)
          const nombreEmisor = this.authService.currentUser()?.name || "";

          // 6. Estructurar datos para el modal de recibo
          const reciboData: IReciboPagoData = {
            codigoRecibo: String(pago.codigoPago).padStart(6, "0"),
            moneda: pago.monedaRecibida,
            montoNumerico: montoPagoActual,
            montoEnLetras: montoEnLetras,
            fechaPago: new Date(pago.fechaPago),
            cliente: nombreCliente,
            concepto: concepto,
            aCuenta: montoPagoActual,
            saldo: saldoConvertido,
            total: totalConvertido,
            metodoPago: pago.metodo,
            nombreEmisor: nombreEmisor,
            esReimpresion: true,
          };

          // Abrir modal de recibo o imprimir directo según pantalla
          const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);
          if (isMobile) {
            this.imprimirReciboDirecto(reciboData);
          } else {
            this.abrirModalRecibo(reciboData);
          }
        },
        error: (err) => {
          console.error("Error al cargar datos del recibo:", err);
          this.notification.error(
            "No se pudo cargar la información del recibo",
          );
        },
      });
  }

  private limpiarNombreCliente(nombre: string): string {
    return nombre
      .split(" - ")[0]
      .replace(/\([^)]*\)/g, "")
      .replace(/CI[:\s]*\d+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private obtenerPagosUnicosPorVenta(
    pagos: IPagos[],
    ventaId: string,
  ): IPagos[] {
    const pagosMap = new Map<string, IPagos>();

    pagos
      .filter(
        (p) =>
          p.ventaId === ventaId &&
          p.estado !== "ANULADO" &&
          p.estado !== "ANULADA",
      )
      .forEach((p) => pagosMap.set(p.pagoId, p));

    return [...pagosMap.values()];
  }

  /**
   * Abre el modal para visualizar e imprimir el recibo de pago.
   */
  private abrirModalRecibo(datos: IReciboPagoData): void {
    const modalRef = this.modalService.open(ModalComprobantePagoComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.datosRecibo = datos;
  }

  private imprimirReciboDirecto(datosRecibo: IReciboPagoData): void {
    this.organizationService.getEmpresa().subscribe({
      next: async (empresa) => {
        let empresaNombre = "TU FUTURO BIENES & RAÍCES";
        let empresaLogo = "";
        let empresaDireccion = "";
        let empresaTelefono = "";

        if (empresa) {
          empresaNombre = empresa.name;
          empresaLogo = empresa.logoUrl;
          empresaDireccion = empresa.address;
          empresaTelefono = empresa.phone;
        }

        let logoBase64: string | undefined;
        if (empresaLogo) {
          try {
            logoBase64 = await this.convertUrlToBase64(empresaLogo);
          } catch (error) {
            console.error("Error cargando logo para PDF (CORS o red)", error);
          }
        }

        const datosCompletos: IReciboPagoData = {
          ...datosRecibo,
          empresaNombre,
          empresaLogo: logoBase64,
          empresaDireccion,
          empresaTelefono,
        };

        try {
          this.reciboPdfService.generarReciboIngreso(datosCompletos, "print");
        } catch (e) {
          console.error("Error abriendo el visor de impresión PDF:", e);
        }
      },
      error: (err) => {
        console.error("Error al cargar info de la organización", err);
        const datosCompletos: IReciboPagoData = {
          ...datosRecibo,
          empresaNombre: "TU FUTURO BIENES & RAÍCES",
          empresaLogo: "assets/images/logo-tu-futuro.png",
        };
        try {
          this.reciboPdfService.generarReciboIngreso(datosCompletos, "print");
        } catch (e) {
          console.error("Error abriendo el visor de impresión PDF:", e);
        }
      }
    });
  }

  private convertUrlToBase64(url: string): Promise<string> {
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
  }
}
