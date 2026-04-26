import { CommonModule } from '@angular/common';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { InputTextareaComponent } from 'src/app/shared/components/atoms/input-textarea/input-textarea.component';
import { SelectMonedaComponent } from 'src/app/shared/components/atoms/select-moneda.component';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';

import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { ImageDisplayComponent } from "src/app/shared/components/atoms/image-display/image-display.component";

@Component({
  selector: 'app-empresa-form-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    InputTextComponent,
    InputNumberComponent,
    InputTextareaComponent,
    SelectMonedaComponent,
    SelectDataComponent,
    CardContainerComponent,
    ImageDisplayComponent
  ],
  templateUrl: 'empresa-form-view.component.html',
  styleUrl: 'empresa-form-view.component.scss'
})
export class EmpresaFormViewComponent {
  @Input() form!: FormGroup;
  @Input() logoUrl: string | '' = '';
  @Output() imageUpdated = new EventEmitter<File>();
  @Output() imageDeleted = new EventEmitter<void>();

  timezonesList = [
    { value: 'America/La_Paz', label: 'Bolivia (GMT-4)' },
    { value: 'UTC', label: 'UTC' },
  ];

  get nameControl() {
    return this.form.get('name') as FormControl;
  }
  get emailControl() {
    return this.form.get('email') as FormControl;
  }
  get addressControl() {
    return this.form.get('address') as FormControl;
  }
  get phoneControl() {
    return this.form.get('phone') as FormControl;
  }
  get currencyControl() {
    return this.form.get('currency') as FormControl;
  }
  get timezoneControl() {
    return this.form.get('timezone') as FormControl;
  }
  get diasVencimientoControl() {
    return this.form.get('diasVencimientoReserva') as FormControl;
  }
  get plazoMaximoControl() {
    return this.form.get('plazoMaximoMeses') as FormControl;
  }
  get horaCronControl() {
    return this.form.get('horaCronDiario') as FormControl;
  }
}
