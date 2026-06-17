import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { InputErrorMessagesComponent } from '../input-error-messages/input-error-messages.component';

@Component({
  selector: 'app-input-date',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzDatePickerModule, InputErrorMessagesComponent],
  template: `
    <div class="input-date-container">
      <nz-date-picker
        [id]="inputId"
        [nzSize]="input_size"
        [nzPlaceHolder]="input_placeholder"
        [formControl]="input_control"
        [nzFormat]="input_format"
        [nzStatus]="input_control.invalid && input_control.touched ? 'error' : ''"
        [nzDisabledDate]="combinedDisabledDate"
        [nzDateRender]="dateRenderFn ? cellTpl : undefined"
        style="width: 100%"
        (ngModelChange)="onDateChange($event)"
      >
      </nz-date-picker>

      <!-- Template interno: aplica la clase CSS devuelta por dateRenderFn a cada celda -->
      <ng-template #cellTpl let-current>
        <div [class]="'ant-picker-cell-inner ' + dateRenderFn!(current)">
          {{ current | date: 'd' }}
        </div>
      </ng-template>

      @if (show_error_messages) {
        <app-input-error-messages [input_control]="input_control">
        </app-input-error-messages>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .input-date-container {
      width: 100%;
    }
    nz-date-picker {
      width: 100%;
      display: block;
    }
    ::ng-deep .ant-picker {
      width: 100%;
    }
  `]
})
export class InputDateComponent {

  @Input() input_control = new FormControl<Date | null>(null);
  @Input() input_size: 'large' | 'default' | 'small' = 'default';
  @Input() inputId = 'date-' + Math.random().toString(36).substring(2, 9);
  @Input() input_placeholder = 'Seleccionar fecha';
  @Input() input_format = 'dd/MM/yyyy';
  @Input() show_error_messages = true;
  @Input() disabled_date?: (current: Date) => boolean;
  @Input() disablePastDates = false;

  /** Función que recibe una fecha y retorna una clase CSS extra para esa celda, o '' si ninguna. */
  @Input() dateRenderFn?: (current: Date) => string;

  @Output() DateValue = new EventEmitter<Date | null>();

  @ViewChild('cellTpl') cellTpl!: TemplateRef<any>;

  combinedDisabledDate = (current: Date): boolean => {
    if (!current) {
      return false;
    }

    // Si se requiere bloquear fechas pasadas, inhabilitamos todo lo menor a "hoy a las 00:00:00"
    if (this.disablePastDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (current < today) {
        return true;
      }
    }

    // Si existe una función de bloqueo externa provista, también la evaluamos
    if (this.disabled_date) {
      return this.disabled_date(current);
    }

    return false;
  };

  onDateChange(date: Date | null): void {
    this.DateValue.emit(date);
  }
}
