import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

import { EEstadoCivil, EGenero, ETipoDocumento } from 'src/app/core/models/cliente.model';
import { EAsesorType, IAsesor } from 'src/app/core/models/asesor/asesor.model';
import { AsesorService } from 'src/app/core/services/asesor.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { InputDocumentoComponent } from 'src/app/shared/components/atoms/input-documento/input-documento.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { SelectDocumentTypeComponent } from 'src/app/shared/components/atoms/select-document-type.component';
import { SelectExpedidoComponent } from 'src/app/shared/components/atoms/select-expedido.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';

@Component({
  selector: 'app-register-propietario-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalContainerComponent,
    FormFieldComponent,
    InputTextComponent,
    InputDocumentoComponent,
    SelectDocumentTypeComponent,
    SelectExpedidoComponent,
    InputNumberComponent,
  ],
  template: `
    <app-modal-container
      [mainTitleModal]="isEditMode ? 'Editar Propietario' : 'Nuevo Propietario'"
      [saveButtonName]="isEditMode ? 'Actualizar Propietario' : 'Registrar Propietario'"
      [saveButtonIcon]="isEditMode ? 'save' : 'user-add'"
      [loading]="loading"
      (SaveAction)="onSave()"
      (CancelAction)="activeModal.dismiss()"
    >
      <form [formGroup]="form" class="row">
        <div class="col-12">
          <app-form-field label="Nombre Completo" [required]="true">
            <app-input-text
              [input_control]="nombreCompletoControl"
              input_placeholder="Ej. Juan Pérez"
            ></app-input-text>
          </app-form-field>
        </div>

        <div class="col-md-4 col-12">
          <app-form-field label="Tipo Documento" [required]="true">
            <app-select-document-type
              [inputControl]="tipoDocumentoControl"
              [placeholder]="'Seleccione'"
            ></app-select-document-type>
          </app-form-field>
        </div>

        <div class="col-md-4 col-12">
          <app-form-field label="Nro. Documento" [required]="true">
            <app-input-documento
              [input_control]="nroDocumentoControl"
              [hasComplemento]="true"
              [placeholder]="'1234567'"
            ></app-input-documento>
          </app-form-field>
        </div>

        <div class="col-md-4 col-12">
          <app-form-field label="Expedido" [required]="true">
            <app-select-expedido
              [inputControl]="complementoControl"
              [placeholder]="'Seleccione'"
            ></app-select-expedido>
          </app-form-field>
        </div>

        <div class="col-md-6 col-12">
          <app-form-field label="Teléfono" [required]="true">
            <app-input-number
              [input_control]="telefonoControl"
              [input_placeholder]="'71234567'"
            ></app-input-number>
          </app-form-field>
        </div>

        <div class="col-md-6 col-12">
          <app-form-field label="Correo Electrónico">
            <app-input-text
              [input_control]="emailControl"
              input_placeholder="ejemplo@correo.com"
            ></app-input-text>
          </app-form-field>
        </div>
      </form>
    </app-modal-container>
  `,
  styles: ``,
})
export class RegisterPropietarioModalComponent implements OnInit {
  @Input() data: IAsesor | null = null;

  public form!: FormGroup;
  public loading = false;
  public isEditMode = false;

  public activeModal = inject(NgbActiveModal);
  private fb = inject(FormBuilder);
  private asesorService = inject(AsesorService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.buildForm();
    if (this.data) {
      this.isEditMode = true;
      this.form.patchValue(this.data);
    }
  }

  get nombreCompletoControl(): FormControl {
    return this.form.get('nombreCompleto') as FormControl;
  }

  get tipoDocumentoControl(): FormControl {
    return this.form.get('tipoDocumento') as FormControl;
  }

  get nroDocumentoControl(): FormControl {
    return this.form.get('nroDocumento') as FormControl;
  }

  get complementoControl(): FormControl {
    return this.form.get('complemento') as FormControl;
  }

  get telefonoControl(): FormControl {
    return this.form.get('telefono') as FormControl;
  }

  get emailControl(): FormControl {
    return this.form.get('email') as FormControl;
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.maxLength(180)]],
      tipoDocumento: [ETipoDocumento.CI, Validators.required],
      nroDocumento: ['', [Validators.required, Validators.maxLength(30)]],
      complemento: [null, [Validators.required, Validators.maxLength(20)]],
      telefono: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.email]],
      tipo: [EAsesorType.PROPIETARIO],
      genero: [EGenero.MASCULINO, Validators.required],
      fechaNacimiento: [null],
      estadoCivil: [EEstadoCivil.SOLTERO, Validators.required],
      ocupacion: ['PROPIETARIO', [Validators.required, Validators.maxLength(150)]],
      direccion: ['SIN ESPECIFICAR', [Validators.required, Validators.maxLength(250)]],
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.warning('Complete los campos requeridos');
      return;
    }

    this.loading = true;
    const value = this.form.getRawValue();

    const payload = {
      ...value,
      email: value.email ? value.email : null,
      fechaNacimiento: value.fechaNacimiento
        ? new Date(value.fechaNacimiento).toISOString()
        : null,
    };

    const request$ = this.isEditMode && this.data
      ? this.asesorService.updateAsesor(this.data.id, payload)
      : this.asesorService.createAsesor(payload);

    request$
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.notification.success(
            this.isEditMode ? 'Propietario actualizado' : 'Propietario registrado'
          );
          this.activeModal.close(true);
        },
        error: (err) => {
          if (err.status === 409) {
            this.notification.error('El documento ya existe');
          } else {
            const msg =
              err.error?.message ||
              `Error al ${this.isEditMode ? 'actualizar' : 'registrar'} propietario`;
            this.notification.error(msg);
          }
        },
      });
  }
}
