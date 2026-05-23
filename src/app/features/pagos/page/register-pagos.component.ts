import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { EMetodoPago } from 'src/app/core/models/pagos.model';
import { Moneda } from 'src/app/core/models/reserva.model';
import { IClientePagoById, IVentaDetalle } from 'src/app/core/models/venta.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PagosService } from 'src/app/core/services/pagos.service';
import { VentaService } from 'src/app/core/services/venta.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { RegisterPagosViewComponent, VentaPagoOption } from '../view/register-pagos-view/register-pagos-view.component';

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
        [form]="form"
        [ventasOpciones]="ventasOpciones"
        [loadingVentas]="loadingVentas"
        [ventaSeleccionada]="ventaSeleccionada"

        (onArchivosChanged)="onArchivosManejado($event)"
        (onCuotasSeleccionadas)="onCuotasManejadas($event)"
      ></app-register-pagos-view>
    </app-page-container>

    <ng-template #confirmTemplate>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; font-size: 14px;">
        <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px dashed #e5e7eb;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280; font-weight: 500; font-size: 12px; text-transform: uppercase;">Propiedad</span>
              <span style="color: #111827; font-weight: 600;">{{ loteInfo }}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280; font-weight: 500; font-size: 12px; text-transform: uppercase;">Cliente</span>
              <span style="color: #111827; font-weight: 600;">{{ ventaSeleccionada?.nombreCompletoCliente || 'N/A' }}</span>
            </div>
          </div>
          <div style="background-color: #f9fafb; border-radius: 6px; padding: 12px; margin-bottom: 20px;">
            <span style="display: block; color: #374151; font-size: 11px; font-weight: 700; margin-bottom: 8px; text-transform: uppercase;">Detalle de Cuotas a Pagar</span>
            <div style="color: #4b5563; font-size: 13px; line-height: 1.4;" [innerHTML]="cuotasTexto"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <div style="font-weight: 600; color: #374151; font-size: 14px;">TOTAL A PAGAR</div>
            <div style="background-color: #1e40af; color: white; padding: 8px 16px; border-radius: 6px; font-weight: 800; font-size: 18px; letter-spacing: 0.5px;">
              {{ totalTexto }}
            </div>
          </div>
        </div>
        <div style="margin-top: 16px; padding: 10px; background-color: #fff7ed; border-left: 4px solid #f97316; border-radius: 4px; color: #9a3412; font-size: 12px; display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px;">ℹ️</span>
          <span>Verifique que el monto y el comprobante coincidan con la transacción bancaria.</span>
        </div>
      </div>
    </ng-template>
  `,
  styles: ``,
})
export class RegisterPagosComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private pagosService = inject(PagosService);
  private ventaService = inject(VentaService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(NzModalService);
  @ViewChild('confirmTemplate', { static: true }) confirmTemplate!: TemplateRef<any>;
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  loading = false;
  loadingVentas = false;
  // Updated to handle multiple comprobante files
  comprobanteArchivos: File[] = [];

  ventasOpciones: VentaPagoOption[] = [];
  ventaSeleccionada: IClientePagoById | null = null;
  ventaDetalleCompleto: IVentaDetalle | null = null;
  cuotasSeleccionadas: any[] = [];
  lastMoneda = 'USD';

  loteInfo = '';
  cuotasTexto = '';
  totalTexto = '';
  ngOnInit(): void {
    this.initForm();
    this.escucharCambiosCliente();
    this.escucharCambiosVenta();
    this.escucharCambiosMonedaRecibida();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onArchivosManejado(files: File[]): void {
    this.comprobanteArchivos = files;
  }

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

    // Obtener información del lote
    this.loteInfo = this.ventaDetalleCompleto
      ? `Manzana ${this.ventaDetalleCompleto.manzana || 'N/A'} — Lote ${this.ventaDetalleCompleto.numeroLote || 'N/A'}`
      : (this.ventaSeleccionada ? `Venta #${this.ventaSeleccionada.nroVenta}` : 'No seleccionado');

    // Obtener información de las cuotas
    this.cuotasTexto = '';
    if (this.cuotasSeleccionadas.length > 0) {
      const cuotasActivas = this.cuotasSeleccionadas.filter(c => c.estado !== 'PAGADO');
      console.log(this.cuotasSeleccionadas, " cuotas marcadas");
      const cuotasList = cuotasActivas.map(c => `#${c.nroCuota}`).join(', ');
      this.cuotasTexto = `<span style="font-weight: 600;">Cuotas a pagar:</span> ${cuotasList}`;
    } else {
      this.cuotasTexto = `<span style="color: #ee9d01; font-weight: 500;">⚠️ Pago a cuenta / Saldo a favor (sin cuotas específicas)</span>`;
    }

    // Total
    this.totalTexto = `${pagoDto.monedaRecibida} ${Number(pagoDto.monto).toFixed(2)}`;

    // Abrir modal de confirmación
    this.modalService.confirm({
      nzTitle: 'Confirmar Registro de Pago',
      nzWidth: 550,
      nzContent: this.confirmTemplate,
      nzOkText: 'Confirmar Registro',
      nzCancelText: 'Cancelar',
      nzOkType: 'primary',
      nzOnOk: () => this.ejecutarRegistroPago(pagoDto),
    });



  }

  onCuotasManejadas(cuotas: any[]): void {
    this.cuotasSeleccionadas = cuotas;
  }

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

  onCancelarClick(): void {
    this.router.navigate(['/pagos']);
  }

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

  private escucharCambiosCliente(): void {
    this.form
      .get('clienteId')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((clienteId: string | null) => {
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

        if (this.ventaSeleccionada?.moneda) {
          this.form.patchValue(
            { monedaRecibida: this.ventaSeleccionada.moneda },
            { emitEvent: false }
          );
          this.lastMoneda = this.ventaSeleccionada.moneda;
        }

        // Cargar detalles de venta para obtener el lote y la manzana
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

          if (this.ventasOpciones.length === 1) {
            const unica = this.ventasOpciones[0];
            this.form.patchValue({ ventaId: unica.ventaId });
          } else if (this.ventasOpciones.length === 0) {
            this.notification.warning(
              'El cliente no tiene ventas a cuotas con saldo pendiente.'
            );
          }
        },
        error: () => {
          this.ventasOpciones = [];
          this.notification.error(
            'No se pudieron cargar las ventas del cliente.'
          );
        },
      });
  }

  private mapVentaOpcion(venta: IClientePagoById): VentaPagoOption {
    return {
      ventaId: venta.ventaId,
      label: `Venta #${venta.nroVenta} — ${venta.frecuenciaPago} — Saldo ${venta.moneda} ${venta.saldoPendiente}`,
      venta,
    };
  }
}
