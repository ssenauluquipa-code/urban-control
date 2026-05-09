import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FrecuenciaPago, TipoPago } from 'src/app/core/models/venta.model';
import { VentaService } from 'src/app/core/services/venta.service';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { RegisterVentaViewComponent } from '../views/register-venta-view/register-venta-view.component';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-ventas',
  standalone: true,
  imports: [RegisterVentaViewComponent, PageContainerComponent],
  template: `
    <app-page-container
      [title]="'Registro de Venta'"
      (Save)="handleSave()"
      [showSave]="true"
    >
      <app-register-venta-view
        [form]="form"
        [loading]="loading"
      ></app-register-venta-view>
    </app-page-container>
  `,
  styles: ``
})
export class RegisterVentasComponent {

  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private loteService = inject(LoteService);
  private cdr = inject(ChangeDetectorRef);
  loading = false;

  form: FormGroup = this.fb.group({
    loteId: [null, [Validators.required]],
    asesorId: [null, [Validators.required]],
    reservaId: [null],
    tipoPago: [TipoPago.CONTADO, [Validators.required]],
    moneda: ['BS', [Validators.required]],
    montoTotal: [{ value: 0, disabled: true }, [Validators.required]],
    cuotaInicial: [0],
    frecuenciaPago: [null],
    modalidadCalendarioPago: [null],
    diaSemanaPago: [null],
    diaPagoMes1: [null],
    diaPagoMes2: [null],
    nroCuotas: [null, [Validators.max(600)]],
    fechaVenta: [new Date(), [Validators.required]],
    fechaPagoInicial: [null],
    observaciones: [''],
    propietarios: [[], [Validators.required, Validators.minLength(1)]]
  });

  constructor() {
    this.listenFormChanges();
  }

  private listenFormChanges() {
    // Escuchar cambios en Lote para traer el precio
    this.form.get('loteId')?.valueChanges.subscribe(id => {
      if (id) {
        this.loteService.getLoteById(id).subscribe(lote => {
          this.form.patchValue({ montoTotal: lote.precioReferencial });
        });
      } else {
        this.form.patchValue({ montoTotal: 0 });
      }
    });

    // Video 02: Si es CONTADO, resetear campos de financiamiento a NULO
    this.form.get('tipoPago')?.valueChanges.subscribe(tipo => {
      this.updateFinancingValidators(tipo);
      this.cdr.detectChanges();
    });

    // Escuchar cambios en frecuencia y modalidad para ajustar validadores
    this.form.get('frecuenciaPago')?.valueChanges.subscribe(() => this.updateFinancingValidators(this.form.get('tipoPago')?.value));
    this.form.get('modalidadCalendarioPago')?.valueChanges.subscribe(() => this.updateFinancingValidators(this.form.get('tipoPago')?.value));
  }

  private updateFinancingValidators(tipo: TipoPago | null) {
    const financingFields = [
      'frecuenciaPago', 'modalidadCalendarioPago', 'diaSemanaPago',
      'diaPagoMes1', 'diaPagoMes2', 'nroCuotas', 'fechaPagoInicial'
    ];

    if (tipo === TipoPago.CONTADO) {
      this.form.patchValue({
        frecuenciaPago: null,
        modalidadCalendarioPago: null,
        diaSemanaPago: null,
        diaPagoMes1: null,
        diaPagoMes2: null,
        nroCuotas: null,
        fechaPagoInicial: null,
        cuotaInicial: null
      }, { emitEvent: false });

      financingFields.forEach(field => {
        this.form.get(field)?.clearValidators();
      });
    } else {
      // BÁSICOS PARA CUOTAS
      this.form.get('frecuenciaPago')?.setValidators([Validators.required]);
      this.form.get('nroCuotas')?.setValidators([Validators.required, Validators.min(1), Validators.max(600)]);
      this.form.get('fechaPagoInicial')?.setValidators([Validators.required]);

      const frecuencia = this.form.get('frecuenciaPago')?.value;
      const modalidad = this.form.get('modalidadCalendarioPago')?.value;

      // SEMANAL -> Requiere Día Semana
      if (frecuencia === FrecuenciaPago.SEMANAL) {
        this.form.get('diaSemanaPago')?.setValidators([Validators.required]);
      } else {
        this.form.get('diaSemanaPago')?.clearValidators();
      }

      // QUINCENAL -> Requiere Modalidad
      if (frecuencia === FrecuenciaPago.QUINCENAL) {
        this.form.get('modalidadCalendarioPago')?.setValidators([Validators.required]);
      } else {
        this.form.get('modalidadCalendarioPago')?.clearValidators();
      }

      // DÍAS FIJOS (MENSUAL O QUINCENAL) -> Requiere Día 1 y/o Día 2
      if (frecuencia === FrecuenciaPago.MENSUAL || modalidad === 'DIAS_FIJOS_MES') {
        this.form.get('diaPagoMes1')?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
        if (modalidad === 'DIAS_FIJOS_MES') {
          this.form.get('diaPagoMes2')?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
        } else {
          this.form.get('diaPagoMes2')?.clearValidators();
        }
      } else {
        this.form.get('diaPagoMes1')?.clearValidators();
        this.form.get('diaPagoMes2')?.clearValidators();
      }
    }

    financingFields.forEach(field => this.form.get(field)?.updateValueAndValidity({ emitEvent: false }));
  }

  handleSave() {
    this.loading = true;
    const rawData = this.form.getRawValue();

    this.ventaService.registrarNuevaVenta(rawData).subscribe({
      next: () => {
        this.notification.success('¡Venta registrada con éxito!');
        this.router.navigate(['/ventas']);
      },
      error: (err) => {
        this.loading = false;
        // Intentar obtener el mensaje específico del servidor, si no, usar uno genérico
        const errorMessage = err.error?.message || 'Error al registrar la venta. Por favor intente de nuevo.';
        this.notification.error(errorMessage);
        console.error("Error en registro:", err);
      },
      complete: () => this.loading = false
    });
  }
}
