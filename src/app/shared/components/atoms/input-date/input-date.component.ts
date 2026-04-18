import { Component, EventEmitter, Input, Output } from '@angular/core';
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
        style="width: 100%"
        (ngModelChange)="onDateChange($event)"
      >
      </nz-date-picker>

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
  @Input() input_format = 'yyyy-MM-dd';
  @Input() show_error_messages = true;

  @Output() DateValue = new EventEmitter<Date | null>();


  onDateChange(date: Date | null): void {
    this.DateValue.emit(date);
  }
}
