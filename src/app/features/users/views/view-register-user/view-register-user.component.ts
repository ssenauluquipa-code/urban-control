import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IUser } from 'src/app/core/models/user.model';
import { ImageUploaderComponent } from 'src/app/shared/components/atoms/image-uploader/image-uploader.component';
import { ModalContainerComponent } from "src/app/shared/components/organisms/modal-container/modal-container.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
@Component({
  selector: 'app-view-register-user',
  standalone: true,
  imports: [ModalContainerComponent,
    FormFieldComponent,
    InputTextComponent,
    NzSelectModule,
    NzFormModule,
    ReactiveFormsModule,
    CommonModule,
    ImageUploaderComponent
  ],
  templateUrl: './view-register-user.component.html',
  styleUrl: './view-register-user.component.scss'
})
export class ViewRegisterUserComponent {

  @Input() userForm!: FormGroup;
  @Input() userData?: IUser | null; // Recibe el objeto IUser si es edición
  @Output() saveUser = new EventEmitter<void>();
  @Output() imageSelected = new EventEmitter<File>();

  // Getters para fácil acceso en el HTML
  get name() { return this.userForm.get('name') as FormControl<string>; }
  get email() { return this.userForm.get('email') as FormControl<string>; }
  get password() { return this.userForm.get('password') as FormControl<string>; }
  get contactNumber() { return this.userForm.get('contactNumber') as FormControl<string>; }
  get role() { return this.userForm.get('role') as FormControl<string>; }
}
