import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from 'src/app/core/models/user.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { ViewRegisterUserComponent } from '../views/view-register-user/view-register-user.component';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [ViewRegisterUserComponent],
  template: `
    <app-view-register-user
      [userForm]="userFormGroup"
      [userData]="userData"
      (saveUser)="onSaveUser()"
      (imageSelected)="onAvatarSelected($event)"
    ></app-view-register-user>
  `,
  styles: ``
})
export class UserRegisterComponent implements OnInit, OnChanges   {

  public userFormGroup!: FormGroup;
  public userData: IUser | null = null; // Recibe datos si es edición
  private selectedAvatarFile: File | null = null;

  get id() { return this.userFormGroup.get('id') as FormControl<string | null>; }
  get name() { return this.userFormGroup.get('name') as FormControl<string>; }
  get email() { return this.userFormGroup.get('email') as FormControl<string>; }
  get password() { return this.userFormGroup.get('password') as FormControl<string>; }
  get role() { return this.userFormGroup.get('role') as FormControl<string>; }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private ngModal: NgbActiveModal,
    private notification: NotificationService
  ) { }
  ngOnChanges(): void {
    this.patchUserData();
  }

  ngOnInit(): void {
    this.buildForm();
    this.patchUserData();
  }

  private buildForm(): void {
    this.userFormGroup = this.fb.group({
      id: [null], // Campo oculto para saber si es edición
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&./*-]).{8,}$/)
      ]], // Requerido solo al crear
      contactNumber: [''],
      role: ['USER', [Validators.required]] // Cambiado VIEWER -> USER para coincidir con backend
    });
  } 

  private patchUserData(): void {
    if (this.userData && this.userFormGroup) {
      this.userFormGroup.patchValue({
        id: this.userData.id,
        name: this.userData.name,
        email: this.userData.email,
        contactNumber: this.userData.contactNumber,
        role: this.userData.role
      });

      // Email no se edita
      this.userFormGroup.get('email')?.disable();

      // Si es edición, quitamos la validación de contraseña
      this.userFormGroup.get('password')?.clearValidators();
      this.userFormGroup.get('password')?.updateValueAndValidity();
    }
  }

  public onAvatarSelected(file: File): void {
    this.selectedAvatarFile = file;
  }

  private uploadAvatarIfSelected(userId: string): void {
    if (this.selectedAvatarFile) {
      this.userService.uploadAvatar(userId, this.selectedAvatarFile).subscribe({
        next: () => console.log('Avatar subido con éxito'),
        error: (err) => {
          this.notification.error('Error al subir el avatar.');
          console.error(err);
        }
      });
    }
  }


  public onSaveUser(): void {
    if (this.userFormGroup.invalid) {
      this.userFormGroup.markAllAsTouched();
      this.notification.warning('Revise los campos obligatorios.');
      return;
    }

    const formValue = this.userFormGroup.getRawValue();

    if (formValue.id) {
      // --- LÓGICA DE EDICIÓN ---
      const payload = {
        name: formValue.name,
        contactNumber: formValue.contactNumber,
        role: formValue.role
      };

      console.log('DATOS PARA ACTUALIZAR USUARIO:', payload);
      this.userService.updateUser(formValue.id, payload).subscribe({
        next: () => {
          if (this.selectedAvatarFile) {
            this.userService.uploadAvatar(formValue.id, this.selectedAvatarFile).subscribe({
              next: () => {
                this.notification.success('Usuario y Avatar actualizados.');
                this.ngModal.close(true);
              },
              error: () => {
                this.notification.warning('Datos actualizados, pero el avatar falló.');
                this.ngModal.close(true);
              }
            });
          } else {
            this.notification.success('Usuario actualizado correctamente.');
            this.ngModal.close(true);
          }
        },
        error: (err) => {
          const mensajeStr = Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message;
          this.notification.error(mensajeStr || 'Error al actualizar usuario.');
          console.error(err);
        }
      });
    } else {
      // --- LÓGICA DE CREACIÓN ---
      // Quitamos el ID para el POST
      const createData = { ...formValue };
      delete createData.id;
      console.log('DATOS PARA REGISTRAR USUARIO:', createData);
      this.userService.createUser(createData).subscribe({
        next: (newUser) => {
          if (this.selectedAvatarFile && newUser.id) {
            this.userService.uploadAvatar(newUser.id, this.selectedAvatarFile).subscribe({
              next: () => {
                this.notification.success('Usuario y Avatar creados exitosamente.');
                this.ngModal.close(true);
              },
              error: () => {
                this.notification.warning('Usuario creado, pero hubo un error con la imagen.');
                this.ngModal.close(true);
              }
            });
          } else {
            this.notification.success('Usuario creado exitosamente.');
            this.ngModal.close(true);
          }
        },
        error: (err) => {
          const mensajeStr = Array.isArray(err.error?.message) ? err.error.message.join(', ') : err.error?.message || 'Error al crear usuario';
          this.notification.error(mensajeStr);
          console.error(err);
        }
      });
    }
  }


}
