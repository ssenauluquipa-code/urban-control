import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { IUpdateProfileDto, IUser } from 'src/app/core/models/user.model';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzButtonModule,
    FormFieldComponent,
    InputTextComponent,
    ModalContainerComponent
  ],
  template: `
    <app-modal-container
      #modal
      mainTitleModal="Editar Mi Perfil"
      [loading]="loading"
      (SaveAction)="submit()"
      (CancelAction)="modal.activeModal.close()"
    >
      <form nz-form nzLayout="vertical" [formGroup]="form" (ngSubmit)="submit()">
        <div class="row">
          <!-- Nombre -->
          <div class="col-12">
            <app-form-field label="Nombre Completo" forId="profileName">
              <app-input-text 
                [input_control]="nameControl" 
                input_placeholder="Tu nombre completo">
              </app-input-text>
            </app-form-field>
          </div>

          <!-- Email -->
          <div class="col-12 col-sm-6">
            <app-form-field label="Correo Electrónico" forId="profileEmail">
              <app-input-text 
                [input_control]="emailControl" 
                input_placeholder="ejemplo@correo.com">
              </app-input-text>
            </app-form-field>
          </div>

          <!-- Teléfono -->
          <div class="col-12 col-sm-6">
            <app-form-field label="Número de Contacto" forId="profilePhone">
              <app-input-text 
                [input_control]="contactControl" 
                input_placeholder="70000000">
              </app-input-text>
            </app-form-field>
          </div>

          <div class="col-12 mt-3">
            <hr>
            <h6 class="mb-3 text-primary">Cambiar Contraseña</h6>
            <p class="text-muted small mb-3">Solo completa estos campos si deseas actualizar tu contraseña actual.</p>
          </div>

          <!-- Contraseña Actual -->
          <div class="col-12 col-sm-6">
            <app-form-field label="Contraseña Actual" forId="currentPass">
              <app-input-text 
                [input_control]="currentPassControl" 
                [input_type]="'password'"
                input_placeholder="********">
              </app-input-text>
            </app-form-field>
          </div>

          <!-- Nueva Contraseña -->
          <div class="col-12 col-sm-6">
            <app-form-field label="Nueva Contraseña" forId="newPass">
              <app-input-text 
                [input_control]="newPassControl" 
                [input_type]="'password'"
                input_placeholder="Mínimo 8 caracteres">
              </app-input-text>
            </app-form-field>
          </div>
        </div>
      </form>
    </app-modal-container>
  `,
  styles: `
    form {
      padding: 0.5rem;
    }
  `
})
export class ProfileFormComponent {

  @Input() loading = false;
  @Input() set userData(user: IUser | null) {
    if (user) {
      this.form.patchValue({
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber
      });
    }
  }

  @Output() Save = new EventEmitter<IUpdateProfileDto>();

  constructor(private fb: FormBuilder) { }

  form = this.fb.group({
    name: [''],
    email: ['', [Validators.email]],
    contactNumber: [''],
    currentPassword: [''],
    newPassword: ['', [Validators.minLength(8)]]
  });

  get nameControl() { return this.form.get('name') as FormControl; }
  get emailControl() { return this.form.get('email') as FormControl; }
  get contactControl() { return this.form.get('contactNumber') as FormControl; }
  get currentPassControl() { return this.form.get('currentPassword') as FormControl; }
  get newPassControl() { return this.form.get('newPassword') as FormControl; }

  submit() {
    if (this.form.valid) {
      const rawValues = this.form.getRawValue();

      const data: IUpdateProfileDto = {
        name: rawValues.name || undefined,
        contactNumber: rawValues.contactNumber || undefined,
        email: rawValues.email || undefined,
      };

      // Solo incluimos campos de contraseña si se ha escrito una nueva
      if (rawValues.newPassword) {
        data.newPassword = rawValues.newPassword;
        data.currentPassword = rawValues.currentPassword || '';
      }

      this.Save.emit(data);
    }
  }

}


