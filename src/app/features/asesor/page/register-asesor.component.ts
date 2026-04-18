import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { IAsesor } from 'src/app/core/models/asesor/asesor.model';
import { EGenero, ETipoDocumento } from 'src/app/core/models/cliente.model';
import { AsesorService } from 'src/app/core/services/asesor.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ModalContainerComponent } from "src/app/shared/components/organisms/modal-container/modal-container.component";
import { RegisterAsesorViewComponent } from "../views/register-asesor-view/register-asesor-view.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-asesor',
  standalone: true,
  imports: [CommonModule, ModalContainerComponent, RegisterAsesorViewComponent],
  template: `
    <app-modal-container
      [mainTitleModal]="isEditMode ? 'Editar Asesor' : 'Nuevo Asesor'"
      [loading]="loading"
      (onSaveAction)="onSubmit()"
      (onCancelAction)="closeModal()">

      <app-register-asesor-view
        [form]="form"
        [loading]="loading">
      </app-register-asesor-view>

    </app-modal-container>
  `,
  styles: ``
})
export class RegisterAsesorComponent implements OnInit {

  @Input() asesorData: IAsesor | null = null; // Para edición

  // Output para notificar al padre que se guardó (opcional, si usas NgbModal result)
  // Pero como usamos inyección activa, podemos usar activeModal.close()

  public form!: FormGroup;
  public loading = false;
  public isEditMode = false;

  private fb = inject(FormBuilder);
  private asesorService = inject(AsesorService);
  private notification = inject(NotificationService);
  // NgbModal active modal para cerrar
  public activeModal = inject(NgbActiveModal); // Necesitas importar NgbActiveModal de @ng-bootstrap/ng-bootstrap

  ngOnInit(): void {
    this.buildForm();
    if (this.asesorData) {
      this.isEditMode = true;
      this.patchForm();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombreCompleto: ['', Validators.required],
      tipoDocumento: [ETipoDocumento.CI, Validators.required],
      nroDocumento: ['', Validators.required],
      genero: [EGenero.MASCULINO, Validators.required],
      fechaNacimiento: [null, Validators.required],
      telefono: [''],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  private patchForm(): void {
    if (!this.asesorData) return;

    // Convertir fecha string a Date object para el DatePicker
    const birthDate = this.asesorData.fechaNacimiento ? new Date(this.asesorData.fechaNacimiento) : null;

    this.form.patchValue({
      ...this.asesorData,
      fechaNacimiento: birthDate
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach(c => c.markAsDirty());
      this.notification.warning('Complete los campos requeridos');
      return;
    }

    this.loading = true;
    const value = this.form.value;

    // Formatear fecha a ISO String
    const payload = {
      ...value,
      fechaNacimiento: value.fechaNacimiento ? new Date(value.fechaNacimiento).toISOString() : null
    };

    const request$ = this.isEditMode
      ? this.asesorService.updateAsesor(this.asesorData!.id, payload)
      : this.asesorService.createAsesor(payload);

    request$.pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.notification.success(this.isEditMode ? 'Asesor actualizado' : 'Asesor creado');
        this.activeModal.close(true); // Cierra el modal y devuelve true
      },
      error: (err) => {
        if (err.status === 409) this.notification.error('El documento ya existe');
        else this.notification.error('Error al guardar');
      }
    });
  }

  closeModal(): void {
    this.activeModal.dismiss();
  }
}
