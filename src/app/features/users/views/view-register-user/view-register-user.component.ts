import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IUser } from 'src/app/core/models/user.model';
import { ImageDisplayComponent } from 'src/app/shared/components/atoms/image-display/image-display.component';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { InputNumberComponent } from "src/app/shared/components/atoms/input-number/input-number.component";
import { SelectAsesorComponent } from 'src/app/shared/components/atoms/select-asesor.component';
import { IAsesorOption } from 'src/app/core/models/asesor/asesor.model';
@Component({
  selector: 'app-view-register-user',
  standalone: true,
  imports: [
    FormFieldComponent,
    InputTextComponent,
    NzSelectModule,
    NzFormModule,
    ReactiveFormsModule,
    CommonModule,
    ImageDisplayComponent,
    InputNumberComponent,
    SelectAsesorComponent
  ],
  templateUrl: './view-register-user.component.html',
  styleUrl: './view-register-user.component.scss'
})
export class ViewRegisterUserComponent {

  @Input() userForm!: FormGroup;
  @Input() userData?: IUser | null; // Recibe el objeto IUser si es edición
  @Output() imageSelected = new EventEmitter<File>();
  @Output() imageDeleted = new EventEmitter<void>();
  @Output() asesorSelected = new EventEmitter<IAsesorOption | null>();

  // Getters para fácil acceso en el HTML
  get name() { return this.userForm.get('name') as FormControl<string>; }
  get email() { return this.userForm.get('email') as FormControl<string>; }
  get password() { return this.userForm.get('password') as FormControl<string>; }
  get contactNumber() { return this.userForm.get('contactNumber') as FormControl<string>; }
  get role() { return this.userForm.get('role') as FormControl<string>; }
  get asesorId() { return this.userForm.get('asesorId') as FormControl<string>; }
}
