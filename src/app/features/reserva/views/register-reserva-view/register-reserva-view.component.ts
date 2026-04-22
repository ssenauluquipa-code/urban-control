import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { SelectClientesComponent } from "src/app/shared/components/atoms/select-clientes.component";
import { SelectManzanasComponent } from "src/app/shared/components/atoms/select-manzanas.component";
import { SelectLotesComponent } from "src/app/shared/components/atoms/select-lotes.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { SelectMonedaComponent } from "src/app/shared/components/atoms/select-moneda.component";
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";
import { InputTextareaComponent } from "src/app/shared/components/atoms/input-textarea/input-textarea.component";

@Component({
  selector: 'app-register-reserva-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, SelectClientesComponent, SelectManzanasComponent, SelectLotesComponent, InputTextComponent, SelectMonedaComponent, InputDateComponent, InputTextareaComponent],
  templateUrl: './register-reserva-view.component.html',
  styleUrl: './register-reserva-view.component.scss'
})
export class RegisterReservaViewComponent {
  // Inputs
  @Input() reservaForm!: FormGroup;
  @Input() proyectoId: string | null = null;

  // Getters para controles
  get clienteId() { return this.reservaForm.get('clienteId') as FormControl; }
  get manzanaId() { return this.reservaForm.get('manzanaId') as FormControl; }
  get loteId() { return this.reservaForm.get('loteId') as FormControl; }
  get montoReserva() { return this.reservaForm.get('montoReserva') as FormControl; }
  get moneda() { return this.reservaForm.get('moneda') as FormControl; }
  get fechaVencimiento() { return this.reservaForm.get('fechaVencimiento') as FormControl; }
  get observaciones() { return this.reservaForm.get('observaciones') as FormControl; }
}
