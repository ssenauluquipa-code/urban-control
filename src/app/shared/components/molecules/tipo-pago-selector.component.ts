import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TipoPago } from "src/app/core/models/venta.model";
import { NzRadioModule } from "ng-zorro-antd/radio";

@Component({
  selector: "app-tipo-pago-selector",
  standalone: true,
  imports: [CommonModule, NzRadioModule, ReactiveFormsModule],
  template: `
    <div class="tipo-pago-container">
      <nz-radio-group
        [formControl]="input_control"
        nzButtonStyle="solid"
        nzSize="default"
        class="w-100 d-flex"
      >
        <label
          nz-radio-button
          [nzValue]="TIPOS.CONTADO"
          class="flex-fill d-flex align-items-center justify-content-center"
        >
          <i class="ph ph-hand-coins me-2 fs-5"></i>
          <span>CONTADO</span>
        </label>

        <label
          nz-radio-button
          [nzValue]="TIPOS.CUOTAS"
          class="flex-fill d-flex align-items-center justify-content-center"
        >
          <i class="ph ph-calendar-plus me-2 fs-5"></i>
          <span>CUOTAS</span>
        </label>
      </nz-radio-group>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .tipo-pago-container {
        width: 100%;
      }

      ::ng-deep .tipo-pago-container .ant-radio-group {
        display: flex !important;
        width: 100%;
        height: 36px;
      }

      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper {
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

      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper:hover {
        color: #1e3467 !important;
        border-color: #1e3467 !important;
      }

      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper:focus,
      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper-focused,
      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper:active {
        color: #1e3467 !important;
        border-color: #1e3467 !important;
        box-shadow: none !important;
      }

      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper::before,
      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper-checked::before {
        background-color: transparent !important;
      }

      ::ng-deep
        .tipo-pago-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ) {
        background: #12223b !important;
        border-color: #12223b !important;
        color: #ffffff !important;
        box-shadow: -1px 0 0 0 #12223b !important;
      }

      ::ng-deep
        .tipo-pago-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ):hover,
      ::ng-deep
        .tipo-pago-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ):focus,
      ::ng-deep
        .tipo-pago-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ):active {
        background: #12223b !important;
        border-color: #12223b !important;
        color: #ffffff !important;
        box-shadow: -1px 0 0 0 #12223b !important;
      }

      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper:first-child {
        border-radius: 8px 0 0 8px;
      }

      ::ng-deep .tipo-pago-container .ant-radio-button-wrapper:last-child {
        border-radius: 0 8px 8px 0;
      }

      i {
        vertical-align: middle;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class TipoPagoSelectorComponent {
  // Tipamos el control correctamente tanto en la propiedad como en el constructor
  @Input() input_control: FormControl<TipoPago | null> =
    new FormControl<TipoPago | null>(TipoPago.CONTADO);

  public readonly TIPOS = TipoPago;
}
