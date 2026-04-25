import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { InputTextareaComponent } from 'src/app/shared/components/atoms/input-textarea/input-textarea.component';
import { SelectMonedaComponent } from 'src/app/shared/components/atoms/select-moneda.component';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';

import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';

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
  ],
  template: `
    <form nz-form [formGroup]="form" nzLayout="vertical">
      <!-- Información Institucional -->
      <app-card-container title="Información Institucional" icon="shop">
        <div class="row">
          <div class="col-12">
            <app-form-field
              label="Nombre de la Organización"
              forId="name"
              [required]="true"
            >
              <app-input-text
                [input_control]="nameControl"
                input_placeholder="Ej. UrbanControl"
                prefix_icon="shop"
              >
              </app-input-text>
            </app-form-field>
          </div>
        </div>
      </app-card-container>

      <!-- Contacto y Ubicación -->
      <div class="mt-4">
        <app-card-container title="Contacto y Ubicación" icon="contacts">
          <div class="row g-3">
            <div class="col-md-6">
              <app-form-field
                label="Correo Electrónico"
                forId="email"
                [required]="true"
              >
                <app-input-text
                  [input_control]="emailControl"
                  input_placeholder="Email"
                  input_type="email"
                  prefix_icon="mail"
                >
                </app-input-text>
              </app-form-field>
            </div>

            <div class="col-md-6">
              <app-form-field
                label="Teléfono / WhatsApp"
                forId="phone"
                [required]="true"
              >
                <app-input-text
                  [input_control]="phoneControl"
                  input_placeholder="Teléfono"
                  prefix_icon="phone"
                >
                </app-input-text>
              </app-form-field>
            </div>

            <div class="col-12">
              <app-form-field
                label="Dirección Física"
                forId="address"
                [required]="true"
              >
                <app-input-textarea
                  [input_control]="addressControl"
                  input_placeholder="Dirección completa"
                  [input_rows]="2"
                >
                </app-input-textarea>
              </app-form-field>
            </div>
          </div>
        </app-card-container>
      </div>
      <div class="row">
        <div class="col-md-6">
          <!-- Configuración Regional -->
          <div class="mt-4">
            <app-card-container title="Configuración Regional" icon="global">
              <div class="row g-3">
                <div class="col-md-6">
                  <app-form-field
                    label="Moneda"
                    forId="currency"
                    [required]="true"
                  >
                    <app-select-moneda
                      [inputControl]="currencyControl"
                      placeholder="Seleccionar moneda"
                    >
                    </app-select-moneda>
                  </app-form-field>
                </div>

                <div class="col-md-6">
                  <app-form-field
                    label="Zona Horaria"
                    forId="timezone"
                    [required]="true"
                  >
                    <app-select-data
                      [inputControl]="timezoneControl"
                      [itemList]="timezonesList"
                      bindLabel="label"
                      bindValue="value"
                      placeholder="Seleccionar zona"
                    >
                    </app-select-data>
                  </app-form-field>
                </div>
              </div>
            </app-card-container>
          </div>
        </div>
        <div class="col-md-6">
          <!-- Parámetros de Sistema -->
          <div class="mt-4">
            <app-card-container title="Parámetros de Sistema" icon="setting">
              <div class="row g-3">
                <div class="col-md-4">
                  <app-form-field
                    label="Vencimiento de Reserva (Días)"
                    forId="diasVencimiento"
                    [required]="true"
                  >
                    <app-input-number
                      [input_control]="diasVencimientoControl"
                      input_placeholder="Ej. 5"
                    >
                    </app-input-number>
                  </app-form-field>
                </div>

                <div class="col-md-4">
                  <app-form-field
                    label="Plazo Máximo (Meses)"
                    forId="plazoMax"
                    [required]="true"
                  >
                    <app-input-number
                      [input_control]="plazoMaximoControl"
                      input_placeholder="Ej. 18"
                    >
                    </app-input-number>
                  </app-form-field>
                </div>

                <div class="col-md-4">
                  <app-form-field
                    label="Hora de Cron Diario (0-23)"
                    forId="horaCron"
                    [required]="true"
                  >
                    <app-input-number
                      [input_control]="horaCronControl"
                      input_placeholder="Ej. 8"
                    >
                    </app-input-number>
                  </app-form-field>
                </div>
              </div>
            </app-card-container>
          </div>
        </div>
      </div>
    </form>
  `,
  styles: ``,
})
export class EmpresaFormViewComponent {
  @Input() form!: FormGroup;

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
