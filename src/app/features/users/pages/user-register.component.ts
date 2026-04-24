import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IUser } from 'src/app/core/models/user.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { UserService } from 'src/app/core/services/user.service';
import { ViewRegisterUserComponent } from '../views/view-register-user/view-register-user.component';
import { catchError, of, switchMap } from 'rxjs';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
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
    >
      <app-view-register-user
        [userForm]="userFormGroup"
        [userData]="userData"
        (imageSelected)="onAvatarSelected($event)"
      ></app-view-register-user>
    </app-modal-container>
  `,
  styles: ``,
})
export class UserRegisterComponent {
  public userFormGroup!: FormGroup;
  private _userData: IUser | null = null;

  @Input()
  set userData(data: IUser | null) {
    this._userData = data;
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
      name: ['', [Validators.required]],
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
      contactNumber: [''],
      role: ['USER', [Validators.required]], // Cambiado VIEWER -> USER para coincidir con backend
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

    // 2. Ajustar validaciones para modo edición
    this.userFormGroup.get('password')?.clearValidators();
    this.userFormGroup.get('password')?.updateValueAndValidity();

    // 3. Llenar con los datos recibidos
    this.userFormGroup.patchValue({
      id: data.id,
      name: data.name,
      email: data.email,
      contactNumber: data.contactNumber,
      role: data.role, // 🔥 Esto es clave para que el select tome el valor
    });

    // 4. Deshabilitar email (lógica de negocio)
    this.userFormGroup.get('email')?.disable();
  }

  /**
   * Captura el evento de selección de imagen proveniente del componente hijo.
   * Guarda el archivo en una variable temporal para procesarlo al guardar.
   * @param file Archivo seleccionado por el usuario.
   */
  public onAvatarSelected(file: File): void {
    this.selectedAvatarFile = file;
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
    console.log('is edit ', isEditMode);

    // 1. Definir la petición principal (Crear o Actualizar)
    let mainRequest$;

    if (isEditMode) {
      console.log('editar usuario');
      // Payload para actualizar (sin email ni contraseña)
      const payload = {
        name: formValue.name,
        contactNumber: formValue.contactNumber,
        role: formValue.role,
      };
      mainRequest$ = this.userService.updateUser(formValue.id, payload);
    } else {
      console.log('registrar usuario');
      // Payload para crear
      const createData = { ...formValue };
      delete createData.id;
      mainRequest$ = this.userService.createUser(createData);
    }
    // 2. Ejecutar cadena de operaciones con RxJS
    mainRequest$
      .pipe(
        switchMap((userResponse: IUser) => {
          // Una vez guardados los datos, verificamos si hay avatar
          if (this.selectedAvatarFile && userResponse.id) {
            return this.userService
              .uploadAvatar(userResponse.id, this.selectedAvatarFile)
              .pipe(
                // Si el avatar falla, capturamos el error para no romper el flujo principal
                catchError((err) => {
                  console.error('Error subiendo avatar', err);
                  this.notification.warning(
                    'Datos guardados, pero ocurrió un error al subir el avatar.',
                  );
                  // Retornamos el usuario original para que el flujo continúe exitosamente
                  return of(userResponse);
                }),
              );
          }
          // Si no hay archivo, simplemente devolvemos la respuesta original
          return of(userResponse);
        }),
      )
      .subscribe({
        next: () => {
          const message = isEditMode
            ? 'Usuario actualizado correctamente.'
            : 'Usuario creado exitosamente.';
          this.notification.success(message);
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
