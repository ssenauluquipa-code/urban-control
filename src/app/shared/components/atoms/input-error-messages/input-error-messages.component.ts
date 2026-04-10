import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-error-messages',
  standalone: true,
  imports: [CommonModule],
  template: `@if (input_control.invalid && input_control.touched) {
              <div class="text-danger">
                @if (input_control.hasError('required')) { <small>Este campo es <b>requerido</b>.</small> }
                @if (input_control.hasError('email')) { <small>Ingrese un email válido.</small> }
                @if (input_control.hasError('minlength')) { <small>Mínimo permitido <b>{{minLength}} caracteres</b>.</small> }
                @if (input_control.hasError('maxlength')) { <small>Máximo permitido <b>{{maxLength}} caracteres</b>.</small> }
                @if (input_control.hasError('min')) { <small>Ingrese un valor mayor a <b>{{minValue}}</b>.</small> }
                @if (input_control.hasError('max')) { <small>Ingrese un valor menor a <b>{{maxValue}}</b>.</small> }
                @if (input_control.hasError('fakeName')) { <small>Ingrese un nombre válido.</small> }
                @if (input_control.hasError('fakeLastName')) { <small>Ingrese un apellido válido.</small> }
                @if (input_control.hasError('DateStart')) { <small>Ingrese una fecha que no sea mayor a la fecha final.</small> }
                @if (input_control.hasError('DateEnd')) { <small>Ingrese una fecha que no sea menor a la fecha inicial.</small> }
                @if (input_control.hasError('pattern')) { <small>{{patternValidMessage}}</small> }
                @if (input_control.hasError('DescuentoGeneral')) { <small>El descuento no puede ser mayor o igual al subtotal.</small> }
              </div>
            }`,
  styles: `
    .text-danger {
      margin-top: 4px;
      font-size: 12px;
    }
  `
})
export class InputErrorMessagesComponent {
  @Input({ required: true }) input_control = new FormControl<unknown>(null);
  @Input() minLength = 0;
  @Input() maxLength = 0;
  @Input() minValue = 0;
  @Input() maxValue = 0;
  @Input() patternValidMessage = 'Ingrese un valor válido';
}
