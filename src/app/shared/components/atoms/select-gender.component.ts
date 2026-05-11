import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { NzRadioModule } from "ng-zorro-antd/radio";
import { EGenero } from "src/app/core/models/cliente.model";

@Component({
  selector: "app-select-gender",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzRadioModule],
  template: `
    <div class="gender-selector-container">
      <nz-radio-group
        [formControl]="inputControl"
        nzButtonStyle="solid"
        nzSize="default"
        class="w-100 d-flex"
      >
        @for (option of genderOptions; track option.value) {
          <label
            nz-radio-button
            [nzValue]="option.value"
            class="flex-fill d-flex align-items-center justify-content-center"
          >
            <span>{{ option.label }}</span>
          </label>
        }
      </nz-radio-group>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .gender-selector-container {
        width: 100%;
      }

      ::ng-deep .gender-selector-container .ant-radio-group {
        display: flex !important;
        width: 100%;
        height: 36px;
      }

      ::ng-deep .gender-selector-container .ant-radio-button-wrapper {
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

      ::ng-deep .gender-selector-container .ant-radio-button-wrapper:hover {
        color: #12223b;
        border-color: #12223b;
      }

      ::ng-deep .gender-selector-container .ant-radio-button-wrapper span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      ::ng-deep .gender-selector-container .ant-radio-button-wrapper:focus,
      ::ng-deep .gender-selector-container .ant-radio-button-wrapper-focused,
      ::ng-deep .gender-selector-container .ant-radio-button-wrapper:active {
        color: #12223b;
        border-color: #12223b;
        box-shadow: none;
      }

      ::ng-deep .gender-selector-container .ant-radio-button-wrapper::before,
      ::ng-deep
        .gender-selector-container
        .ant-radio-button-wrapper-checked::before {
        background-color: transparent !important;
      }

      ::ng-deep
        .gender-selector-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ) {
        background: #12223b;
        border-color: #12223b;
        color: #ffffff;
        box-shadow: -1px 0 0 0 #12223b;
      }

      ::ng-deep
        .gender-selector-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ):hover,
      ::ng-deep
        .gender-selector-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ):focus,
      ::ng-deep
        .gender-selector-container
        .ant-radio-button-wrapper-checked:not(
          .ant-radio-button-wrapper-disabled
        ):active {
        background: #1e3467;
        border-color: #1e3467;
        color: #ffffff;
        box-shadow: -1px 0 0 0 #1e3467;
      }

      ::ng-deep
        .gender-selector-container
        .ant-radio-button-wrapper:first-child {
        border-radius: 8px 0 0 8px;
      }

      ::ng-deep
        .gender-selector-container
        .ant-radio-button-wrapper:last-child {
        border-radius: 0 8px 8px 0;
      }
    `,
  ],
})
export class SelectGenderComponent {
  @Input() inputControl = new FormControl<string | null>(null);

  public genderOptions = Object.values(EGenero).map((val) => ({
    value: val,
    label: val.charAt(0) + val.slice(1).toLowerCase(),
  }));
}
