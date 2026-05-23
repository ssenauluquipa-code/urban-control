import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { IClientePagoById } from 'src/app/core/models/venta.model';
import { PlanCuotasCronogramaComponent } from '../../components/plan-cuotas-cronograma/plan-cuotas-cronograma.component';
import { ImageDisplayMultipleComponent } from 'src/app/shared/components/atoms/image-display-multiple/image-display-multiple.component';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { InputTextareaComponent } from 'src/app/shared/components/atoms/input-textarea/input-textarea.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { MetodoPagoSelectorComponent } from 'src/app/shared/components/molecules/metodo-pago-selector.component';
import { SelectMonedaComponent } from 'src/app/shared/components/atoms/select-moneda.component';
import { SelectClientesComponent } from 'src/app/shared/components/atoms/select-clientes.component';

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
    SelectDataComponent,
    InputTextareaComponent,
    InputNumberComponent,
    MetodoPagoSelectorComponent,
    SelectMonedaComponent,
    SelectClientesComponent,
  ],
  templateUrl: './register-pagos-view.component.html',
  styleUrl: './register-pagos-view.component.scss',
})
export class RegisterPagosViewComponent {
  @Input() form!: FormGroup;
  @Input() ventasOpciones: VentaPagoOption[] = [];
  @Input() loadingVentas = false;
  @Input() ventaSeleccionada: IClientePagoById | null = null;
  @Output() onArchivosChanged = new EventEmitter<File[]>();
  @Output() onCuotasSeleccionadas = new EventEmitter<any[]>();

  get clienteId(): FormControl {
    return this.form.get('clienteId') as FormControl;
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

  get montoConvertidoParaCronograma(): number {
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
  }

  onMontoCalculadoHandler(montoCalculadoEnContrato: number): void {
    if (!this.ventaSeleccionada) {
      this.monto.setValue(montoCalculadoEnContrato);
      return;
    }

    const monedaContrato = this.ventaSeleccionada.moneda;
    const monedaPago = this.monedaValue;
    const tipoCambio = this.ventaSeleccionada.tipoCambio || 1;

    if (monedaContrato === monedaPago) {
      this.monto.setValue(Number(montoCalculadoEnContrato.toFixed(2)));
      return;
    }

    let montoConvertido = montoCalculadoEnContrato;
    if (monedaContrato === 'USD' && monedaPago === 'BS') {
      montoConvertido = montoCalculadoEnContrato * tipoCambio;
    } else if (monedaContrato === 'BS' && monedaPago === 'USD') {
      montoConvertido = montoCalculadoEnContrato / tipoCambio;
    }

    this.monto.setValue(Number(montoConvertido.toFixed(2)));
  }


}
