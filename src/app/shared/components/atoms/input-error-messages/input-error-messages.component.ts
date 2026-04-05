import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-error-messages',
  standalone: true,
  imports: [CommonModule],
  template: `<div *ngIf="input_control.invalid && input_control.touched" class="text-danger">
              <small *ngIf="input_control.hasError('required')">Este campo es <b>requerido</b>.</small>
              <small *ngIf="input_control.hasError('email')">Ingrese un email válido.</small>
              <small *ngIf="input_control.hasError('minlength')">Mínimo permitido <b>{{minLength}} caracteres</b>.</small>
              <small *ngIf="input_control.hasError('maxlength')">Máximo permitido <b>{{maxLength}} caracteres</b>.</small>
              <small *ngIf="input_control.hasError('min')">Ingrese un valor mayor a <b>{{minValue}}</b>.</small>
              <small *ngIf="input_control.hasError('max')">Ingrese un valor menor a <b>{{maxValue}}</b>.</small>
              <small *ngIf="input_control.hasError('fakeName')">Ingrese un nombre válido.</small>
              <small *ngIf="input_control.hasError('fakeLastName')">Ingrese un apellido válido.</small>
              <small *ngIf="input_control.hasError('DateStart')">Ingrese una fecha que no sea mayor a la fecha final.</small>
              <small *ngIf="input_control.hasError('DateEnd')">Ingrese una fecha que no sea menor a la fecha inicial.</small>
              <small *ngIf="input_control.hasError('pattern')">{{patternValidMessage}}</small>
              <small *ngIf="input_control.hasError('DescuentoGeneral')">El descuento no puede ser mayor o igual al subtotal.</small>
            </div>`,
  styles: `
    .text-danger {
      margin-top: 4px;
      font-size: 12px;
    }
  `
})
export class InputErrorMessagesComponent {
  @Input({ required: true }) input_control = new FormControl<any>(null);
  @Input() minLength: number = 0;
  @Input() maxLength: number = 0;
  @Input() minValue: number = 0;
  @Input() maxValue: number = 0;
  @Input() patternValidMessage: string = 'Ingrese un valor válido';
}
