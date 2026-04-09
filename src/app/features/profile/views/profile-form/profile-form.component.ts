import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { IUpdateProfileDto, IUser } from 'src/app/core/models/user.model';
import { ImageUploaderComponent } from 'src/app/shared/components/atoms/image-uploader/image-uploader.component';
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
    ImageUploaderComponent, 
    FormFieldComponent, 
    InputTextComponent,
    ModalContainerComponent
  ],
  template: `
    <app-modal-container
      #modal
      mainTitleModal="Editar Mi Perfil"
      [loading]="loading"
      (onSaveAction)="submit()"
      (onCancelAction)="modal.activeModal.close()"
    >
      <div class="profile-form-layout">
        <!-- Foto de Perfil / Avatar -->
        <div class="user-avatar-col">
          <app-image-uploader
            [initialPreview]="avatarUrl || ''"
            uploadTitle="Cambiar foto"
            (imageSelected)="ImageSelected.emit($event)">
          </app-image-uploader>
        </div>

        <!-- Campos del formulario -->
        <div class="user-fields-col">
          <form nz-form nzLayout="vertical" [formGroup]="form" (ngSubmit)="submit()">
            <div class="row">
              <!-- Nombre -->
              <div class="col-12">
                <app-form-field label="Nombre Completo" [required]="true" forId="profileName">
                  <app-input-text 
                    [input_control]="nameControl" 
                    input_placeholder="Tu nombre completo">
                  </app-input-text>
                </app-form-field>
              </div>

              <!-- Email (Read Only) -->
              <div class="col-12">
                <app-form-field label="Correo Electrónico" forId="profileEmail">
                  <app-input-text 
                    [input_control]="emailControl" 
                    [customStyles]="{ 'background-color': '#f5f5f5' }">
                  </app-input-text>
                </app-form-field>
              </div>

              <!-- Teléfono -->
              <div class="col-12">
                <app-form-field label="Número de Contacto" [required]="true" forId="profilePhone">
                  <app-input-text 
                    [input_control]="contactControl" 
                    input_placeholder="70000000">
                  </app-input-text>
                </app-form-field>
              </div>
            </div>
          </form>
        </div>
      </div>
    </app-modal-container>
  `,
  styles: `
    .profile-form-layout {
      display: flex;
      flex-direction: row;
      gap: 1.5rem;
      align-items: flex-start;
      padding: 0.5rem;
    }

    .user-avatar-col {
      flex-shrink: 0;
      width: 200px;
    }

    .user-fields-col {
      flex: 1;
      min-width: 0;
    }

    @media (max-width: 767.98px) {
      .profile-form-layout {
        flex-direction: column;
        align-items: center;
      }
      .user-avatar-col {
        width: 100%;
        max-width: 200px;
        margin-bottom: 1rem;
      }
    }
  `
})
export class ProfileFormComponent {

  @Input() loading = false;
  @Input() avatarUrl: string | null = null;
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
  @Output() ImageSelected = new EventEmitter<File>();

  constructor(private fb: FormBuilder) { }

  form = this.fb.group({
    name: ['', [Validators.required]],
    email: [{ value: '', disabled: true }],
    contactNumber: ['', [Validators.required]]
  });

  get nameControl() { return this.form.get('name') as FormControl; }
  get emailControl() { return this.form.get('email') as FormControl; }
  get contactControl() { return this.form.get('contactNumber') as FormControl; }

  submit() {
    if (this.form.valid) {
      this.Save.emit(this.form.getRawValue() as IUpdateProfileDto);
    }
  }

}


