import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil, skip } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { EMetodoPago } from 'src/app/core/models/pagos.model';
import { Moneda } from 'src/app/core/models/reserva.model';
import { IClientePagoById, IVentaDetalle } from 'src/app/core/models/venta.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PagosService } from 'src/app/core/services/pagos.service';
import { VentaService } from 'src/app/core/services/venta.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { RegisterPagosViewComponent, VentaPagoOption } from '../view/register-pagos-view/register-pagos-view.component';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { ModalVerificacionPagoComponent } from '../components/modal-verificacion-pago/modal-verificacion-pago.component';

@Component({
  selector: 'app-register-pagos',
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
        (onArchivosChanged)="onArchivosManejado($event)"
        (onCuotasSeleccionadas)="onCuotasManejadas($event)"
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
  lastMoneda = 'USD';

  loteInfo = '';
  cuotasTexto = '';
  totalTexto = '';
  esPagoContadoDirecto = false;
  clienteIdContado: string | null = null;
  private currentProjectId$ = toObservable(this.globalContext.currentProjectId);

  // ==========================
  // CICLO DE VIDA
  // ==========================

  constructor() {
    const navigation = this.router.getCurrentNavigation();
    console.log("desde venta a pago ", navigation);
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
      console.log("desde venta directa ", this.clienteIdContado);
      this.ventaSeleccionada = {
        ventaId: state.ventaId,
        nroVenta: state.nroVenta,
        fechaVenta: state.fechaVenta,
        moneda: state.moneda,
        tipoCambio: state.tipoCambio,
        montoTotal: state.montoTotal,
        saldoPendiente: state.saldoPendiente,
        nombreCompletoCliente: state.nombreCompletoCliente,
        nroDocumentoCliente: '',
        frecuenciaPago: 'CONTADO',
        totalPagado: 0,
        nroCuotas: 0,
        montoCuota: 0
      };
      this.lastMoneda = state.moneda;
    }
  }

  ngOnInit(): void {
    this.initForm();

    // Si venimos de un flujo de Venta Directa, preparamos la UI
    if (this.esPagoContadoDirecto && this.ventaSeleccionada) {
      this.ventasOpciones = [{
        ventaId: this.ventaSeleccionada.ventaId,
        label: `Venta #${this.ventaSeleccionada.nroVenta} — CONTADO — Saldo ${this.ventaSeleccionada.moneda} ${this.ventaSeleccionada.saldoPendiente}`,
        venta: this.ventaSeleccionada
      }];

      this.form.patchValue({
        clienteId: this.clienteIdContado,
        ventaId: this.ventaSeleccionada.ventaId,
        monto: this.ventaSeleccionada.saldoPendiente,
        monedaRecibida: this.ventaSeleccionada.moneda
      }, { emitEvent: false });

      this.form.get('clienteId')?.disable();
      this.form.get('ventaId')?.disable();
    }

    // Escuchar cambios de proyecto para limpiar contextos antiguos
    this.currentProjectId$       .pipe(
        skip(1),
        takeUntil(this.destroy$)
      )
      .subscribe((projectId: string | null) => {
        this.form.patchValue({ clienteId: null, ventaId: null }, { emitEvent: false });
        this.ventaSeleccionada = null;
        this.ventaDetalleCompleto = null;
        this.ventasOpciones = [];
        this.cdr.markForCheck();
      });

    this.escucharCambiosCliente();
    this.escucharCambiosVenta();
    this.escucharCambiosMonedaRecibida();
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
      this.notification.warning('Complete correctamente los campos requeridos.');
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
      ? `Manzana ${this.ventaDetalleCompleto.manzana || 'N/A'} — Lote ${this.ventaDetalleCompleto.numeroLote || 'N/A'}`
      : (this.ventaSeleccionada ? `Venta #${this.ventaSeleccionada.nroVenta}` : 'No seleccionado');

    this.cuotasTexto = '';
    if (this.cuotasSeleccionadas.length > 0) {
      const cuotasActivas = this.cuotasSeleccionadas.filter(c => c.estado !== 'PAGADO');
      const cuotasList = cuotasActivas.map(c => `#${c.nroCuota}`).join(', ');
      this.cuotasTexto = `<span style="font-weight: 600;">Cuotas a pagar:</span> ${cuotasList}`;
    } else {
      this.cuotasTexto = `<span style="color: #ee9d01; font-weight: 500;">⚠️ Pago a cuenta / Saldo a favor (sin cuotas específicas)</span>`;
    }

    this.totalTexto = `${pagoDto.monedaRecibida} ${Number(pagoDto.monto).toFixed(2)}`;

    // Abrir modal de confirmación
    const modalRef = this.modalService.open(ModalVerificacionPagoComponent, {
      size: 'md',
      backdrop: 'static',
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
    this.router.navigate(['/pagos']);
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

    this.pagosService
      .registrarPagoConArchivo(pagoDto, this.comprobanteArchivos)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.notification.success('¡Pago registrado con éxito!');
          this.router.navigate(['/pagos']);
        },
        error: (err) => {
          const errorMessage =
            err.error?.message || 'Error al registrar el pago.';
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
      observaciones: [''],
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
      .get('clienteId')
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
      .get('ventaId')
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
            { emitEvent: false }
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
            }
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
      .get('monedaRecibida')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((nuevaMoneda: string) => {
        const montoCtrl = this.form.get('monto');
        const montoActual = montoCtrl?.value || 0;

        if (!this.ventaSeleccionada || montoActual <= 0) {
          this.lastMoneda = nuevaMoneda;
          return;
        }

        const tipoCambio = this.ventaSeleccionada.tipoCambio || 1;

        if (this.lastMoneda === 'USD' && nuevaMoneda === 'BS') {
          // De USD a BS: multiplicar
          const nuevoMonto = Number((montoActual * tipoCambio).toFixed(2));
          montoCtrl?.setValue(nuevoMonto, { emitEvent: false });
        } else if (this.lastMoneda === 'BS' && nuevaMoneda === 'USD') {
          // De BS a USD: dividir
          const nuevoMonto = Number((montoActual / tipoCambio).toFixed(2));
          montoCtrl?.setValue(nuevoMonto, { emitEvent: false });
        }

        this.lastMoneda = nuevaMoneda;
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
        })
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
              'El cliente no tiene ventas a cuotas con saldo pendiente.'
            );
          }
        },
        error: (err) => {
          console.error('[DEBUG] Error al cargar ventas del cliente:', err);
          this.ventasOpciones = [];
          this.notification.error(
            'No se pudieron cargar las ventas del cliente.'
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
}
