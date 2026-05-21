import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, finalize, switchMap, takeUntil } from 'rxjs';

import { EMetodoPago } from 'src/app/core/models/pagos.model';
import { Moneda } from 'src/app/core/models/reserva.model';
import { IClientePagoById } from 'src/app/core/models/venta.model';
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
        [comprobanteArchivo]="comprobanteArchivo"
        (onArchivoChanged)="onArchivoManejado($event)"
      ></app-register-pagos-view>
    </app-page-container>
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
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  loading = false;
  loadingVentas = false;
  comprobanteArchivo: File | null = null;

  ventasOpciones: VentaPagoOption[] = [];
  ventaSeleccionada: IClientePagoById | null = null;
  lastMoneda = 'USD';

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

  onArchivoManejado(file: File | null): void {
    this.comprobanteArchivo = file;
  }

  onGuardarClick(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.warning('Complete correctamente los campos requeridos.');
      return;
    }

    this.loading = true;
    const rawData = this.form.getRawValue();

    const pagoDto = {
      ventaId: rawData.ventaId,
      monto: rawData.monto,
      monedaRecibida: rawData.monedaRecibida,
      metodo: rawData.metodo,
      fechaPago: rawData.fechaPago,
      observaciones: rawData.observaciones,
    };

    this.pagosService
      .registrarPago(pagoDto)
      .pipe(
        switchMap((nuevoPago) => {
          if (this.comprobanteArchivo && nuevoPago.pagoId) {
            const formData = new FormData();
            formData.append('file', this.comprobanteArchivo);
            return this.pagosService.agregarComprobantes(nuevoPago.pagoId, formData);
          }
          return [nuevoPago];
        }),
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
