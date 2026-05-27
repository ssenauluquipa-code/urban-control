import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from 'src/app/core/models/user.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { ViewRegisterUserComponent } from '../views/view-register-user/view-register-user.component';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { IAsesorOption } from 'src/app/core/models/asesor/asesor.model';
@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [ViewRegisterUserComponent, ModalContainerComponent],
  template: `
    <app-modal-container
      #modal
      [mainTitleModal]="userData ? 'Editar Usuario' : 'Registrar Usuario'"
      (SaveAction)="onSaveUser()"
      (CancelAction)="activeModal.dismiss()"
      [loading]="loading"
    >
      <app-view-register-user
        [userForm]="userFormGroup"
        [userData]="userData"
        (imageSelected)="onAvatarSelected($event)"
        (imageDeleted)="onAvatarDeleted()"
        (asesorSelected)="onAsesorSelected($event)"
      ></app-view-register-user>
    </app-modal-container>
  `,
  styles: ``,
})
export class UserRegisterComponent {
  public userFormGroup!: FormGroup;
  private _userData: IUser | null = null;
  public loading = false;

  @Input()
  set userData(data: IUser | null) {
    this._userData = data;
    this.selectedAvatarFile = null;
    // Si hay datos (modo edición), llenamos el formulario inmediatamente
    if (data) {
      this.patchUserData(data);
    }
  }
  get userData(): IUser | null {
    return this._userData;
  }
  /** Archivo de imagen seleccionado temporalmente para subir como avatar */
  private selectedAvatarFile: File | null = null;
  /** Bandera: el usuario quiere eliminar el avatar actual (solo edición) */
  private avatarMarkedForDeletion = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    public activeModal: NgbActiveModal,
    private notification: NotificationService,
  ) {
    this.buildForm();
  }

  /**
   * Inicializa el grupo de controles del formulario con sus validaciones por defecto.
   * Incluye validación fuerte para contraseña y campos requeridos.
   * @private
   */
  private buildForm(): void {
    this.userFormGroup = this.fb.group({
      id: [null], // Campo oculto para saber si es edición
      name: ['', [Validators.required, Validators.maxLength(120)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&./*-]).{8,}$/,
          ),
        ],
      ], // Requerido solo al crear
      contactNumber: ['', [Validators.required]],
      role: ['USER', [Validators.required]], // Cambiado VIEWER -> USER para coincidir con backend
      asesorId: [null],
    });
  }

  /**
   * Si el componente recibió `userData` (modo edición), rellena el formulario
   * y ajusta las validaciones (ej: deshabilitar email, ignorar contraseña).
   * @private
   */
  private patchUserData(data: IUser): void {
    // 1. Resetear el formulario a su estado inicial
    this.userFormGroup.reset();
    this.selectedAvatarFile = null;
    this.avatarMarkedForDeletion = false;

    // 2. Ajustar validaciones para modo edición
    this.userFormGroup.get('password')?.clearValidators();
    this.userFormGroup.get('password')?.updateValueAndValidity();

    // 3. Llenar con los datos recibidos
    this.userFormGroup.patchValue({
      id: data.id,
      name: data.name,
      email: data.email,
      contactNumber: this.normalizeContactNumber(data.contactNumber),
      role: data.role, // 🔥 Esto es clave para que el select tome el valor
      asesorId: data.asesorId,
    });

    // 4. Deshabilitar email (lógica de negocio)
    //this.userFormGroup.get('email')?.disable();
  }

  /** Normaliza el teléfono a solo dígitos (requerido por el input numérico). */
  private normalizeContactNumber(value: string | number | null | undefined): string {
    return String(value ?? '').replace(/\D/g, '');
  }

  /**
   * Captura el evento de selección de imagen proveniente del componente hijo.
   * Guarda el archivo en una variable temporal para procesarlo al guardar.
   * @param file Archivo seleccionado por el usuario.
   */
  public onAvatarSelected(file: File): void {
    this.selectedAvatarFile = file;
    this.avatarMarkedForDeletion = false;
  }

  /**
   * Resetea el archivo seleccionado si el usuario elimina la imagen en el componente.
   */
  public onAvatarDeleted(): void {
    this.selectedAvatarFile = null;
    this.avatarMarkedForDeletion = !!this.userData?.id;
  }

  /**
   * Al seleccionar un asesor, auto-completamos los campos de contacto del usuario.
   * @param asesor Datos del asesor seleccionado.
   */
  public onAsesorSelected(asesor: IAsesorOption | null): void {
    if (asesor) {
      this.userFormGroup.patchValue({
        name: asesor.nombreCompleto,
        email: asesor.email,
        contactNumber: this.normalizeContactNumber(asesor.telefono),
      });
      this.notification.info(`Datos cargados desde el asesor: ${asesor.nombreCompleto}`);
    }
  }

  /**
   * Maneja la lógica principal de guardado.
   * 1. Valida el formulario.
   * 2. Determina si es Creación o Edición.
   * 3. Ejecuta la petición principal y encadena la subida del avatar si existe.
   */
  public onSaveUser(): void {
    if (this.userFormGroup.invalid) {
      this.userFormGroup.markAllAsTouched();
      this.notification.warning(
        'Por favor complete todos los campos obligatorios.',
      );
      return;
    }

    const formValue = this.userFormGroup.getRawValue();
    const isEditMode = !!formValue.id;
    const userId = formValue.id as string;
    const contactNumber = this.normalizeContactNumber(formValue.contactNumber);

    this.loading = true;
    const mainRequest$ = isEditMode
      ? this.userService.updateUser(userId, {
          name: formValue.name,
          contactNumber,
          role: formValue.role,
          asesorId: formValue.asesorId,
        })
      : this.userService.createUser({
          name: formValue.name,
          email: formValue.email,
          password: formValue.password,
          contactNumber,
          role: formValue.role,
          asesorId: formValue.asesorId,
        });

    mainRequest$
      .pipe(
        switchMap((userResponse: IUser | null) => {
          const targetUserId = isEditMode ? userId : userResponse?.id;

          if (!targetUserId) {
            return of({ avatarUploaded: false, avatarDeleted: false, avatarError: false });
          }

          if (this.avatarMarkedForDeletion && !this.selectedAvatarFile) {
            return this.userService.deleteAvatar(targetUserId).pipe(
              map(() => ({ avatarUploaded: false, avatarDeleted: true, avatarError: false })),
              catchError((err) => {
                console.error('Error eliminando avatar', err);
                return of({ avatarUploaded: false, avatarDeleted: false, avatarError: true });
              }),
            );
          }

          if (!this.selectedAvatarFile) {
            return of({ avatarUploaded: false, avatarDeleted: false, avatarError: false });
          }

          return this.userService.uploadAvatar(targetUserId, this.selectedAvatarFile).pipe(
            map(() => ({ avatarUploaded: true, avatarDeleted: false, avatarError: false })),
            catchError((err) => {
              console.error('Error subiendo avatar', err);
              return of({ avatarUploaded: false, avatarDeleted: false, avatarError: true });
            }),
          );
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: ({ avatarUploaded, avatarDeleted, avatarError }) => {
          if (avatarError) {
            this.notification.warning(
              'Datos guardados, pero ocurrió un error al subir el avatar.',
            );
          }

          if (isEditMode) {
            this.notification.success(
              avatarUploaded
                ? 'Usuario y avatar actualizados correctamente.'
                : avatarDeleted
                  ? 'Usuario actualizado y avatar eliminado correctamente.'
                : 'Usuario actualizado correctamente.',
            );
          } else {
            this.notification.success(
              avatarUploaded
                ? 'Usuario creado y avatar subido exitosamente.'
                : 'Usuario creado exitosamente.',
            );
          }

          this.activeModal.close(true);
        },
        error: (err) => {
          const mensajeStr = Array.isArray(err.error?.message)
            ? err.error.message.join(', ')
            : err.error?.message;
          this.notification.error(mensajeStr || 'Ocurrió un error inesperado.');
        },
      });
  }
}
