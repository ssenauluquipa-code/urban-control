import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Moneda } from 'src/app/core/models/reserva.model';
import { NzRadioModule } from 'ng-zorro-antd/radio';

@Component({
  selector: 'app-select-moneda',
  standalone: true,
  imports: [CommonModule, NzRadioModule, ReactiveFormsModule],
  template: `
    <div class="moneda-container">
      <nz-radio-group
        [formControl]="input_control"
        (ngModelChange)="onSelect($event)"
        nzButtonStyle="solid"
        nzSize="default"
        class="w-100 d-flex"
      >
        <label
          nz-radio-button
          [nzValue]="MONEDA.BS"
          class="flex-fill d-flex align-items-center justify-content-center"
        >
          <i class="ph ph-currency-circle-dollar me-2 fs-5"></i>
          <span>BS</span>
        </label>

        <label
          nz-radio-button
          [nzValue]="MONEDA.USD"
          class="flex-fill d-flex align-items-center justify-content-center"
        >
          <i class="ph ph-money me-2 fs-5"></i>
          <span>USD</span>
        </label>
      </nz-radio-group>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    ::ng-deep .moneda-container .ant-radio-group {
      display: flex !important;
      width: 100%;
      height: 36px;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper {
      flex: 1;
      text-align: center;
      display: flex !important;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      letter-spacing: 0.3px;
      transition: all 0.3s ease;
      height: 36px !important;
      line-height: 36px !important;
      padding: 0 !important;
      border-color: #d9d9d9;
      color: #475569;
      background: #ffffff;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper:hover {
      color: #1e3467 !important;
      border-color: #1e3467 !important;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper::before,
    ::ng-deep .moneda-container .ant-radio-button-wrapper-checked::before {
      background-color: transparent !important;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper-checked {
      background: #12223b !important;
      border-color: #12223b !important;
      color: #ffffff !important;
      box-shadow: -1px 0 0 0 #12223b !important;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper-checked:hover,
    ::ng-deep .moneda-container .ant-radio-button-wrapper-checked:focus {
      background: #12223b !important;
      border-color: #12223b !important;
      color: #ffffff !important;
      box-shadow: -1px 0 0 0 #12223b !important;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper-disabled {
      opacity: 0.75;
      cursor: not-allowed !important;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper:first-child {
      border-radius: 8px 0 0 8px;
    }

    ::ng-deep .moneda-container .ant-radio-button-wrapper:last-child {
      border-radius: 0 8px 8px 0;
    }

    i {
      vertical-align: middle;
      font-size: 1.1rem;
    }
  `]
})
export class SelectMonedaComponent {

  @Input() input_control: FormControl<Moneda | null> = new FormControl<Moneda | null>(Moneda.BS);

  @Output() Change = new EventEmitter<Moneda | null>();

  public readonly MONEDA = Moneda;

  onSelect(value: Moneda | null): void {
    this.Change.emit(value);
  }
}