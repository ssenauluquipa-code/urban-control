import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IUser } from 'src/app/core/models/user.model';
import { ImageDisplayComponent } from 'src/app/shared/components/atoms/image-display/image-display.component';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
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
    NzIconModule,
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

  // Getters para verificar los requisitos de contraseña individualmente
  get passValue(): string {
    return this.password?.value || '';
  }

  get hasMinLength(): boolean {
    return this.passValue.length >= 8;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.passValue);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.passValue);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.passValue);
  }

  get hasSpecial(): boolean {
    return /[@$!%*?&./*-]/.test(this.passValue);
  }

  get requirementsMetCount(): number {
    let count = 0;
    if (this.hasMinLength) count++;
    if (this.hasUpperCase) count++;
    if (this.hasLowerCase) count++;
    if (this.hasNumber) count++;
    if (this.hasSpecial) count++;
    return count;
  }

  getStrengthClass(segmentIndex: number): string {
    if (!this.passValue) {
      return 'bg-light-gray';
    }
    const met = this.requirementsMetCount;
    if (segmentIndex > met) {
      return 'bg-light-gray';
    }
    if (met <= 2) {
      return 'bg-danger';
    } else if (met <= 4) {
      return 'bg-warning';
    } else {
      return 'bg-success';
    }
  }
}

