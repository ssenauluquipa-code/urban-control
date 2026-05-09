import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputNumberComponent } from '../atoms/input-number/input-number.component';

@Component({
  selector: 'app-input-dia-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputNumberComponent],
  template: `
    <app-input-number
      [input_control]="input_control"
      [input_minvalue]="1"
      [input_maxvalue]="31"
      input_placeholder="1-31"
      prefix_icon="calendar"
    ></app-input-number>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class InputDiaPagoComponent {
  @Input() input_control = new FormControl<number | null>(null);
}