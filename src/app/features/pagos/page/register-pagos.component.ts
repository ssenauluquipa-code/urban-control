import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, finalize, takeUntil, skip } from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { EMetodoPago } from "src/app/core/models/pagos.model";
import { Moneda } from "src/app/core/models/reserva.model";
import {
  IClientePagoById,
  IVentaDetalle,
} from "src/app/core/models/venta.model";
import { NotificationService } from "src/app/core/services/notification.service";
import { PagosService } from "src/app/core/services/pagos.service";
import { VentaService } from "src/app/core/services/venta.service";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import {
  RegisterPagosViewComponent,
  VentaPagoOption,
} from "../view/register-pagos-view/register-pagos-view.component";
import { ProjectStatusGlobalService } from "src/app/core/services/project-status-global.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { ModalVerificacionPagoComponent } from "../components/modal-verificacion-pago/modal-verificacion-pago.component";
import { CurrencyCalculationService } from "src/app/core/services/finance/currency-calculation.service";
import { AuthService } from "src/app/core/services/auth.service";
import {
  IReciboPagoData,
  ModalComprobantePagoComponent,
} from "../components/modal-comprobante-pago/modal-comprobante-pago.component";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { OrganizationService } from "src/app/core/services/configuracion/organization.service";
import { ReciboPdfService } from "src/app/core/services/recibo-pdf.service";


@Component({
  selector: "app-register-pagos",
  standalone: true,
  imports: [RegisterPagosViewComponent, PageContainerComponent],
  template: `
    <app-page-container
      [title]="'Registro de Pago'"
      [showSave]="true"
      [showCancel]="true"
      [showOptions]="false"
      [loading]="loading"
      (Save)="onGuardarClick()"
      (Cancel)="onCancelarClick()"
    >
      <app-register-pagos-view
        [proyectoId]="globalContext.currentProjectId()"
        [form]="form"
        [ventasOpciones]="ventasOpciones"
        [loadingVentas]="loadingVentas"
        [ventaSeleccionada]="ventaSeleccionada"
        [montoConvertido]="montoConvertidoParaCronograma"
        (onArchivosChanged)="onArchivosManejado($event)"
        (onCuotasSeleccionadas)="onCuotasManejadas($event)"
        (onMontoDesdeCronograma)="onMontoDesdeCronogramaHandler($event)"
      ></app-register-pagos-view>
    </app-page-container>
  `,
  styles: ``,
})
export class RegisterPagosComponent implements OnInit, OnDestroy {
  // ==========================
  // INYECCIÓN DE DEPENDENCIAS
  // ==========================
  private fb = inject(FormBuilder);
  private pagosService = inject(PagosService);
  private ventaService = inject(VentaService);
  public globalContext = inject(ProjectStatusGlobalService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(NgbModal);
  private destroy$ = new Subject<void>();
  private currencyService = inject(CurrencyCalculationService);
  private authService = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private organizationService = inject(OrganizationService);
  private reciboPdfService = inject(ReciboPdfService);


  // ==========================
  // ESTADO DEL COMPONENTE
  // ==========================
  form!: FormGroup;
  loading = false;
  loadingVentas = false;
  comprobanteArchivos: File[] = [];

  ventasOpciones: VentaPagoOption[] = [];
  ventaSeleccionada: IClientePagoById | null = null;
  ventaDetalleCompleto: IVentaDetalle | null = null;
  cuotasSeleccionadas: any[] = [];
  lastMoneda = "USD";

  loteInfo = "";
  cuotasTexto = "";
  totalTexto = "";
  esPagoContadoDirecto = false;
  clienteIdContado: string | null = null;
  private currentProjectId$ = toObservable(this.globalContext.currentProjectId);

  // ==========================
  // CICLO DE VIDA
  // ==========================

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as {
      ventaId: string;
      nroVenta: number;
      fechaVenta: string;
      moneda: string;
      tipoCambio: number;
      montoTotal: number;
      saldoPendiente: number;
      nombreCompletoCliente: string;
      clienteId?: string;
      esContadoDirecto?: boolean;
    };

    // Manejo del flujo especial: Pago Contado Directo (desde Registro de Ventas)
    if (state && state.esContadoDirecto) {
      this.esPagoContadoDirecto = true;
      this.clienteIdContado = state.clienteId || null;
      this.ventaSeleccionada = {
        ventaId: state.ventaId,
        nroVenta: state.nroVenta,
        fechaVenta: state.fechaVenta,
        moneda: state.moneda,
        tipoCambio: state.tipoCambio,
        montoTotal: state.montoTotal,
        saldoPendiente: state.saldoPendiente,
        nombreCompletoCliente: state.nombreCompletoCliente,
        nroDocumentoCliente: "",
        frecuenciaPago: "CONTADO",
        totalPagado: 0,
        nroCuotas: 0,
        montoCuota: 0,
      };
      this.lastMoneda = state.moneda;
    }
    console.log("venta seleccionada ", this.ventaSeleccionada);
  }

  ngOnInit(): void {
    this.initForm();

    // Si venimos de un flujo de Venta Directa, preparamos la UI
    if (this.esPagoContadoDirecto && this.ventaSeleccionada) {
      this.ventasOpciones = [
        {
          ventaId: this.ventaSeleccionada.ventaId,
          label: `Venta #${this.ventaSeleccionada.nroVenta} — CONTADO — Saldo ${this.ventaSeleccionada.moneda} ${this.ventaSeleccionada.saldoPendiente}`,
          venta: this.ventaSeleccionada,
        },
      ];

      this.form.patchValue(
        {
          clienteId: this.clienteIdContado,
          ventaId: this.ventaSeleccionada.ventaId,
          monto: this.ventaSeleccionada.saldoPendiente,
          monedaRecibida: this.ventaSeleccionada.moneda,
        },
        { emitEvent: false },
      );

      this.form.get("clienteId")?.disable();
      this.form.get("ventaId")?.disable();
    }

    // Escuchar cambios de proyecto para limpiar contextos antiguos
    this.currentProjectId$
      .pipe(skip(1), takeUntil(this.destroy$))
      .subscribe((projectId: string | null) => {
        this.form.patchValue(
          { clienteId: null, ventaId: null },
          { emitEvent: false },
        );
        this.ventaSeleccionada = null;
        this.ventaDetalleCompleto = null;
        this.ventasOpciones = [];
        this.cdr.markForCheck();
      });

    this.escucharCambiosCliente();
    this.escucharCambiosVenta();
    this.escucharCambiosMonedaRecibida();
    this.escucharCambiosMonto();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================
  // ACCIONES DE USUARIO
  // ==========================

  /**
   * Maneja el clic en el botón Guardar.
   * Valida el formulario y abre el modal de confirmación.
   */
  onGuardarClick(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.warning(
        "Complete correctamente los campos requeridos.",
      );
      return;
    }

    const rawData = this.form.getRawValue();

    const pagoDto = {
      ventaId: rawData.ventaId,
      monto: rawData.monto,
      monedaRecibida: rawData.monedaRecibida,
      metodo: rawData.metodo,
      fechaPago: rawData.fechaPago,
      observaciones: rawData.observaciones,
    };

    // Construir textos descriptivos para el modal
    this.loteInfo = this.ventaDetalleCompleto
      ? `Manzana ${this.ventaDetalleCompleto.manzana || "N/A"} — Lote ${this.ventaDetalleCompleto.numeroLote || "N/A"}`
      : this.ventaSeleccionada
        ? `Venta #${this.ventaSeleccionada.nroVenta}`
        : "No seleccionado";

    this.cuotasTexto = "";
    if (this.cuotasSeleccionadas.length > 0) {
      const cuotasActivas = this.cuotasSeleccionadas.filter(
        (c) => c.estado !== "PAGADO",
      );
      const cuotasList = cuotasActivas.map((c) => `#${c.nroCuota}`).join(", ");
      this.cuotasTexto = `<span style="font-weight: 600;">Cuotas a pagar:</span> ${cuotasList}`;
    } else {
      this.cuotasTexto = `<span style="color: #ee9d01; font-weight: 500;">⚠️ Pago a cuenta / Saldo a favor (sin cuotas específicas)</span>`;
    }

    this.totalTexto = `${pagoDto.monedaRecibida} ${Number(pagoDto.monto).toFixed(2)}`;

    // Abrir modal de confirmación
    const modalRef = this.modalService.open(ModalVerificacionPagoComponent, {
      size: "md",
      backdrop: "static",
      keyboard: false,
      centered: true,
    });

    modalRef.componentInstance.loteInfo = this.loteInfo;
    modalRef.componentInstance.cuotasTexto = this.cuotasTexto;
    modalRef.componentInstance.totalTexto = this.totalTexto;
    modalRef.componentInstance.ventaSeleccionada = this.ventaSeleccionada;

    modalRef.result
      .then((confirmed) => {
        if (confirmed) this.ejecutarRegistroPago(pagoDto);
      })
      .catch(() => undefined);
  }

  /**
   * Cancela la operación y regresa al listado de pagos.
   */
  onCancelarClick(): void {
    this.router.navigate(["/pagos"]);
  }

  /**
   * Recibe la lista de archivos seleccionados en el componente visual.
   * @param files Array de objetos File.
   */
  onArchivosManejado(files: File[]): void {
    this.comprobanteArchivos = files;
  }

  /**
   * Recibe la lista de cuotas seleccionadas para el pago.
   * @param cuotas Array de cuotas marcadas.
   */
  onCuotasManejadas(cuotas: any[]): void {
    this.cuotasSeleccionadas = cuotas;
  }

  // ==========================
  // LÓGICA PRINCIPAL (Guardar)
  // ==========================

  /**
   * Ejecuta la petición al backend para registrar el pago.
   * Maneja los estados de carga y redirección.
   * @param pagoDto Objeto con los datos del pago a registrar.
   */
  private ejecutarRegistroPago(pagoDto: any): void {
    this.loading = true;
    this.cdr.markForCheck();
    // Control de cierre/moneda (El ajuste que revisará David)
    if (
      this.ventaSeleccionada &&
      this.ventaSeleccionada.moneda === "BS" &&
      pagoDto.monedaRecibida === "USD"
    ) {
      const tipoCambio = this.ventaSeleccionada.tipoCambio || 1;
      const saldoPendienteBs = this.ventaSeleccionada.saldoPendiente;
      const simulacionBackendBs = Number(
        (pagoDto.monto * tipoCambio).toFixed(2),
      );
      const diferenciaCentavos = Math.abs(
        saldoPendienteBs - simulacionBackendBs,
      );

      /*  if (diferenciaCentavos <= 0.10) {
        pagoDto.observaciones = pagoDto.observaciones
          ? `${pagoDto.observaciones}`
          : '[CIERRE AJUSTE MONEDA]';
      } */
    }

    /* console.log('=== [PAGOS] Enviando payload definitivo ===', pagoDto); */

    this.pagosService
      .registrarPagoConArchivo(pagoDto, this.comprobanteArchivos)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (response: any) => {
          this.notification.success("¡Pago registrado con éxito!");
          //this.router.navigate(['/pagos']);
          // 🎯 VERIFICACIÓN Y APERTURA DEL MODAL DEL RECIBO
          if (response && response.success && response.data) {
            const pagoData = response.data;

            const tipoCambio = this.ventaSeleccionada?.tipoCambio || 1;
            const contratoMoneda = this.ventaSeleccionada?.moneda as Moneda;
            const pagoMoneda = pagoData.monedaRecibida as Moneda;

            const totalConvertido = this.currencyService.convertirMonto(
              this.ventaSeleccionada?.montoTotal || 0,
              contratoMoneda,
              pagoMoneda,
              tipoCambio,
            );

            const saldoDespuesDelPagoEnContrato = Math.max(
              (this.ventaSeleccionada?.saldoPendiente || 0) - pagoData.monto,
              0,
            );

            const saldoConvertido = this.currencyService.convertirMonto(
              saldoDespuesDelPagoEnContrato,
              contratoMoneda,
              pagoMoneda,
              tipoCambio,
            );

            // 1. Estructuramos el payload fuertemente tipado para el recibo
            const reciboPayload: IReciboPagoData = {
              codigoRecibo: String(pagoData.codigoPago).padStart(6, "0"), // Ej: 001039
              moneda: pagoData.monedaRecibida,
              montoNumerico: pagoData.montoRecibido,
              montoEnLetras: this.convertirMontoALetras(
                pagoData.montoRecibido,
                pagoData.monedaRecibida,
              ),
              fechaPago: new Date(pagoData.fechaPago),
              cliente:
                this.ventaSeleccionada?.nombreCompletoCliente ||
                "Cliente General",
              concepto: `Pago de lote por concepto de: ${this.ventaSeleccionada?.montoTotal || "Adquisición de Inmueble"} ${contratoMoneda || ""}. ${pagoData.observaciones || ""}`,
              aCuenta: pagoData.montoRecibido,
              saldo: saldoConvertido,
              total: totalConvertido,
              metodoPago: pagoData.metodo,
              nombreEmisor: this.authService.currentUser()?.name || "",
            };

            // 2. Ejecutamos el flujo híbrido según el tamaño de pantalla
            const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);
            if (isMobile) {
              this.imprimirReciboDirecto(reciboPayload);
            } else {
              this.abrirModalRecibo(reciboPayload);
            }
          } else {
            // Si por alguna razón no viene data del recibo, redirige directo
            this.router.navigate(["/ventas"]);
          }
        },
        error: (err) => {
          const errorMessage =
            err.error?.message || "Error al registrar el pago.";
          this.notification.error(errorMessage);
        },
      });
  }

  // ==========================
  // INICIALIZACIÓN Y FORMULARIO
  // ==========================

  /**
   * Inicializa el formulario reactivo con validaciones por defecto.
   */
  private initForm(): void {
    this.form = this.fb.group({
      clienteId: [null, [Validators.required]],
      ventaId: [null, [Validators.required]],
      metodo: [EMetodoPago.EFECTIVO, [Validators.required]],
      monedaRecibida: [Moneda.USD, [Validators.required]],
      monto: [0, [Validators.required, Validators.min(0.01)]],
      fechaPago: [
        new Date().toISOString().substring(0, 10),
        [Validators.required],
      ],
      observaciones: [""],
    });
  }

  // ==========================
  /* *   ESCUCHADORES DE CAMBIOS (Reactividad) */
  // ==========================

  /**
   * Escucha cambios en el campo Cliente.
   * Limpia ventas anteriores y carga las nuevas opciones para el cliente seleccionado.
   */
  private escucharCambiosCliente(): void {
    this.form
      .get("clienteId")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((clienteId: string | null) => {
        // Limpiamos selección previa de venta
        this.form.patchValue({ ventaId: null }, { emitEvent: false });
        this.ventaSeleccionada = null;
        this.ventasOpciones = [];

        if (!clienteId) {
          this.cdr.markForCheck();
          return;
        }

        this.cargarVentasPorCliente(clienteId);
      });
  }

  /**
   * Escucha cambios en el campo Venta.
   * Actualiza la moneda y recupera detalles del lote para mostrar contexto.
   */
  private escucharCambiosVenta(): void {
    this.form
      .get("ventaId")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((ventaId: string | null) => {
        if (!ventaId) {
          this.ventaSeleccionada = null;
          this.ventaDetalleCompleto = null;
          this.cdr.markForCheck();
          return;
        }

        const opcion = this.ventasOpciones.find((v) => v.ventaId === ventaId);
        this.ventaSeleccionada = opcion?.venta ?? null;

        // Auto-seleccionar moneda de la venta
        if (this.ventaSeleccionada?.moneda) {
          this.form.patchValue(
            { monedaRecibida: this.ventaSeleccionada.moneda },
            { emitEvent: false },
          );
          this.lastMoneda = this.ventaSeleccionada.moneda;
        }

        // Cargar detalles extra (Manzana/Lote)
        this.ventaDetalleCompleto = null;
        this.ventaService
          .obtenerVentaPorId(ventaId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (detalle) => {
              this.ventaDetalleCompleto = detalle;
              this.cdr.markForCheck();
            },
            error: () => {
              this.ventaDetalleCompleto = null;
            },
          });

        this.cdr.markForCheck();
      });
  }

  /**
   * Escucha cambios en la moneda de pago.
   * Realiza conversión automática de monto (USD <-> BS) basado en el tipo de cambio de la venta.
   */
  private escucharCambiosMonedaRecibida(): void {
    this.form
      .get("monedaRecibida")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((nuevaMoneda: string) => {
        const montoCtrl = this.form.get("monto");
        const montoActual = montoCtrl?.value || 0;

        if (!this.ventaSeleccionada) {
          this.lastMoneda = nuevaMoneda;
          return;
        }

        const tipoCambio = this.ventaSeleccionada.tipoCambio || 1;

        if (this.lastMoneda !== nuevaMoneda && montoActual > 0) {
          const montoConvertido = this.currencyService.convertirMonto(
            montoActual,
            this.lastMoneda as Moneda,
            nuevaMoneda as Moneda,
            tipoCambio,
          );
          montoCtrl?.setValue(montoConvertido, { emitEvent: false });
        }

        this.lastMoneda = nuevaMoneda;
        this.cdr.markForCheck();
      });
  }

  /**
   * Escucha cambios en el monto ingresado manualmente para actualizar el cronograma visual
   */
  private escucharCambiosMonto(): void {
    this.form
      .get("monto")
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  // ==========================
  // DATOS Y SERVICIOS
  // ==========================

  /**
   * Obtiene del servicio las ventas disponibles para el cliente seleccionado.
   * Mapea los resultados al formato de opciones para el select/grid.
   * @param clienteId ID del cliente a buscar.
   */
  private cargarVentasPorCliente(clienteId: string): void {
    this.loadingVentas = true;

    this.ventaService
      .listarVentasPagoPorCliente(clienteId)
      .pipe(
        finalize(() => {
          this.loadingVentas = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (ventas) => {
          this.ventasOpciones = ventas.map((v) => this.mapVentaOpcion(v));

          // Auto-seleccionar si hay solo una opción
          if (this.ventasOpciones.length === 1) {
            const unica = this.ventasOpciones[0];
            this.form.patchValue({ ventaId: unica.ventaId });
          } else if (this.ventasOpciones.length === 0) {
            this.notification.warning(
              "El cliente no tiene ventas a cuotas con saldo pendiente.",
            );
          }
        },
        error: (err) => {
          console.error("[DEBUG] Error al cargar ventas del cliente:", err);
          this.ventasOpciones = [];
          this.notification.error(
            "No se pudieron cargar las ventas del cliente.",
          );
        },
      });
  }

  /**
   * Transforma el objeto de venta del backend en el formato simplificado para la UI (Option).
   * @param venta Objeto crudo del backend.
   * @returns Objeto formateado para el componente visual.
   */
  private mapVentaOpcion(venta: IClientePagoById): VentaPagoOption {
    return {
      ventaId: venta.ventaId,
      label: `Venta #${venta.nroVenta} — ${venta.frecuenciaPago} — Saldo ${venta.moneda} ${venta.saldoPendiente}`,
      venta,
    };
  }

  /**
   * Calcula cuánto vale el pago en la moneda del CONTRATO para el cronograma.
   * Usa el servicio oficial para coincidir con el Backend.
   */
  get montoConvertidoParaCronograma(): number {
    const montoRaw = this.form.get("monto")?.value || 0;

    // Si no hay venta seleccionada, devolvemos el monto tal cual
    if (!this.ventaSeleccionada) return montoRaw;

    const monedaContrato = this.ventaSeleccionada.moneda;
    const monedaPago = this.form.get("monedaRecibida")?.value;
    const tipoCambio = this.ventaSeleccionada.tipoCambio || 1;

    // Si monedas son iguales, no hay conversión
    if (monedaContrato === monedaPago) {
      return montoRaw;
    }

    return this.currencyService.convertirMonto(
      montoRaw,
      monedaPago as Moneda, // Desde lo que pagas
      monedaContrato as Moneda, // A lo que vale el lote
      tipoCambio,
    );
  }

  /**
   * Maneja el monto calculado por el cronograma.
   * Convierte la moneda del CONTRATO a la moneda de PAGO usando el servicio oficial.
   */
  public onMontoDesdeCronogramaHandler(montoEnContrato: number): void {
    if (!this.ventaSeleccionada) {
      this.form.get("monto")?.setValue(montoEnContrato);
      return;
    }

    const monedaContrato = this.ventaSeleccionada.moneda;
    const monedaPago = this.form.get("monedaRecibida")?.value;
    const tipoCambio = this.ventaSeleccionada.tipoCambio || 1;

    let montoFinal = montoEnContrato;

    // Solo convertimos si las monedas son diferentes
    if (monedaContrato !== monedaPago) {
      montoFinal = this.currencyService.convertirMonto(
        montoEnContrato,
        monedaContrato as Moneda, // Desde moneda del contrato
        monedaPago as Moneda, // A moneda que el usuario paga
        tipoCambio,
      );
    }

    this.form.get("monto")?.setValue(montoFinal);
  }

  private abrirModalRecibo(datos: IReciboPagoData): void {
    const modalRef = this.modalService.open(ModalComprobantePagoComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.datosRecibo = datos;
    modalRef.result.then(
      (result) => {
        this.router.navigate(["/pagos"]);
      },
      () => {
        this.router.navigate(["/pagos"]);
      },
    );
  }

  private convertirMontoALetras(monto: number, moneda: string): string {
    // Aquí puedes invocar un helper existente de tu sistema o una función simple.
    // Como ejemplo de formateo base:
    const sufijoMoneda = moneda === "BS" ? "BOLIVIANOS" : "DÓLARES AMERICANOS";

    // Si tienes una librería de conversión de texto la usas aquí, si no, puedes dejar un formato descriptivo temporal:
    return `${monto.toLocaleString("es-BO")} ${sufijoMoneda}`;
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

        this.router.navigate(["/pagos"]);
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
        this.router.navigate(["/pagos"]);
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
