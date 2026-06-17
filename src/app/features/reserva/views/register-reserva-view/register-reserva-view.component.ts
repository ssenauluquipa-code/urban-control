import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Moneda } from 'src/app/core/models/reserva.model';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { SelectClientesComponent } from "src/app/shared/components/atoms/select-clientes.component";
import { SelectManzanasComponent } from "src/app/shared/components/atoms/select-manzanas.component";
import { SelectLotesComponent } from "src/app/shared/components/atoms/select-lotes.component";
import { SelectMonedaComponent } from "src/app/shared/components/atoms/select-moneda.component";
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";
import { InputTextareaComponent } from "src/app/shared/components/atoms/input-textarea/input-textarea.component";
import { InputNumberComponent } from "src/app/shared/components/atoms/input-number/input-number.component";
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-register-reserva-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, SelectClientesComponent, SelectManzanasComponent, SelectLotesComponent, SelectMonedaComponent, InputDateComponent, InputTextareaComponent, InputNumberComponent, CardContainerComponent, NzInputModule],
  templateUrl: './register-reserva-view.component.html',
  styleUrl: './register-reserva-view.component.scss'
})
export class RegisterReservaViewComponent {
  // Inputs
  @Input() reservaForm!: FormGroup;
  @Input() proyectoId: string | null = null;
  @Input() isEditMode = false;
  @Input() reservaData: any = null;

  // Getters para controles
  get clienteId() { return this.reservaForm.get('clienteId') as FormControl<string>; }
  get manzanaId() { return this.reservaForm.get('manzanaId') as FormControl<string>; }
  get loteId() { return this.reservaForm.get('loteId') as FormControl<string>; }
  get montoReserva() { return this.reservaForm.get('montoReserva') as FormControl<number>; }
  get moneda() { return this.reservaForm.get('moneda') as FormControl<Moneda>; }
  get tipoCambio() { return this.reservaForm.get('tipoCambio') as FormControl<number>; }
  get fechaVencimiento() { return this.reservaForm.get('fechaVencimiento') as FormControl<Date>; }
  get observaciones() { return this.reservaForm.get('observaciones') as FormControl<string>; }

  // Método para sincronizar manzana cuando se selecciona un lote
  onManzanaFromLote(manzanaId: string | null): void {
    if (manzanaId && manzanaId !== this.manzanaId.value) {
      this.manzanaId.setValue(manzanaId);
    }
  }

  onMonedaChange(moneda: Moneda | null): void {
    // Lógica para cuando cambie la moneda (ej. recalcular tipo de cambio o totales)
  }
}
