import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IClientePagoById } from 'src/app/core/models/venta.model';
import { PlanCuotasCronogramaComponent } from '../../components/plan-cuotas-cronograma/plan-cuotas-cronograma.component';
import { ImageDisplayMultipleComponent } from 'src/app/shared/components/atoms/image-display-multiple/image-display-multiple.component';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputTextareaComponent } from 'src/app/shared/components/atoms/input-textarea/input-textarea.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { MetodoPagoSelectorComponent } from 'src/app/shared/components/molecules/metodo-pago-selector.component';
import { SelectMonedaComponent } from 'src/app/shared/components/atoms/select-moneda.component';
import { SelectClientesComponent } from 'src/app/shared/components/atoms/select-clientes.component';
import { SelectVentaGridComponent } from '../../components/select-venta-grid/select-venta-grid.component';
import { CurrencyCalculationService } from 'src/app/core/services/finance/currency-calculation.service';

export interface VentaPagoOption {
  ventaId: string;
  label: string;
  venta: IClientePagoById;
}

@Component({
  selector: 'app-register-pagos-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardContainerComponent,
    ImageDisplayMultipleComponent,
    PlanCuotasCronogramaComponent,
    FormFieldComponent,
    InputTextareaComponent,
    InputNumberComponent,
    MetodoPagoSelectorComponent,
    SelectMonedaComponent,
    SelectClientesComponent,
    SelectVentaGridComponent
  ],
  templateUrl: './register-pagos-view.component.html',
  styleUrl: './register-pagos-view.component.scss',
})
export class RegisterPagosViewComponent {
  @Input() form!: FormGroup;
  @Input() ventasOpciones: VentaPagoOption[] = [];
  @Input() loadingVentas = false;
  @Input() ventaSeleccionada: IClientePagoById | null = null;
  @Input() proyectoId: string | null = null;
  @Input() montoConvertido: number = 0; // Recibe el dato calculado
  @Output() onArchivosChanged = new EventEmitter<File[]>();
  @Output() onCuotasSeleccionadas = new EventEmitter<any[]>();
  @Output() onMontoDesdeCronograma = new EventEmitter<number>();

  private currencyCalc = inject(CurrencyCalculationService);

  get clienteId(): FormControl {
    return this.form.get('clienteId') as FormControl;
  }

  get clientePreCargado(): any {
    if (this.clienteId?.value && this.ventaSeleccionada?.nombreCompletoCliente) {
      return {
        id: this.clienteId.value,
        nombreCompleto: this.ventaSeleccionada.nombreCompletoCliente
      };
    }
    return null;
  }

  get ventaId(): FormControl {
    return this.form.get('ventaId') as FormControl;
  }

  get metodo(): FormControl {
    return this.form.get('metodo') as FormControl;
  }

  get monedaRecibida(): FormControl {
    return this.form.get('monedaRecibida') as FormControl;
  }

  get monto(): FormControl {
    return this.form.get('monto') as FormControl;
  }

  get fechaPago(): FormControl {
    return this.form.get('fechaPago') as FormControl;
  }

  get observaciones(): FormControl {
    return this.form.get('observaciones') as FormControl;
  }

  get ventaIdValue(): string | null {
    return this.ventaId?.value || null;
  }

  get montoValue(): number {
    return this.monto?.value || 0;
  }

  get monedaValue(): string {
    return this.monedaRecibida?.value || 'USD';
  }

 /*  get montoConvertidoParaCronograma(): number {
    const montoRaw = this.montoValue;
    if (!this.ventaSeleccionada) return montoRaw;

    const monedaContrato = this.ventaSeleccionada.moneda;
    const monedaPago = this.monedaValue;
    const tipoCambio = this.ventaSeleccionada.tipoCambio || 1;

    if (monedaContrato === monedaPago) {
      return montoRaw;
    }

    if (monedaContrato === 'USD' && monedaPago === 'BS') {
      return Number((montoRaw / tipoCambio).toFixed(2));
    }

    if (monedaContrato === 'BS' && monedaPago === 'USD') {
      return Number((montoRaw * tipoCambio).toFixed(2));
    }

    return montoRaw;
  } */

  /**
   * Recibe el monto del cronograma y lo pasa al Contenedor.
   * La VISTA NO hace cálculos ni conversiones aquí.
   */
  onMontoCalculadoHandler(montoCalculadoEnContrato: number): void {
    // Si no hay venta, emitimos tal cual (o 0)
    if (!this.ventaSeleccionada) {
      this.monto.setValue(this.currencyCalc.roundCurrency(montoCalculadoEnContrato));
      return;
    }

    // ¡IMPORTANTE! No multiplicamos ni dividimos aquí.
    // Simplemente le pasamos el dato al Padre (Contenedor) para que él use el Servicio.
    this.onMontoDesdeCronograma.emit(montoCalculadoEnContrato);
  }

 // Agrega este método para manejar el evento del hijo
  onVentaSeleccionadaDesdeGrid(ventaId: string): void {
    this.ventaId.setValue(ventaId);
  }

  onMonedaChange(moneda: any): void {
    // Lógica para cuando cambie la moneda
  }
}
