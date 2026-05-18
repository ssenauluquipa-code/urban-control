import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { EAsesorType, IAsesor } from 'src/app/core/models/asesor/asesor.model';
import { EGenero, ETipoDocumento } from 'src/app/core/models/cliente.model';
import { AsesorService } from 'src/app/core/services/asesor.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { RegisterAsesorViewComponent } from "../views/register-asesor-view/register-asesor-view.component";
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { EAppModule } from 'src/app/core/config/permissions.enum';

@Component({
  selector: 'app-register-asesor',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, RegisterAsesorViewComponent],
  template: `
    <app-page-container
      [title]="isEditMode ? 'Editar Asesor' : 'Nuevo Asesor'"
      [permissionScope]="EAppModule.ASESORES"
      (Save)="onSubmit()"
      (Cancel)="goBack()"
      [showSave]="true"
      [showCancel]="true"
      [loading]="loading"
      [showOptions]="false"
      >
      <app-register-asesor-view
        [form]="form"
        [loading]="loading">
      </app-register-asesor-view>
    </app-page-container>
  `,
  styles: ``
})
export class RegisterAsesorComponent implements OnInit {
  public readonly EAppModule = EAppModule;

  public form!: FormGroup;
  public loading = false;
  public isEditMode = false;
  public asesorData: IAsesor | null = null;
  private asesorId?: string;

  private fb = inject(FormBuilder);
  private asesorService = inject(AsesorService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.buildForm();
    this.checkEditMode();
  }

  private checkEditMode(): void {
    this.asesorId = this.route.snapshot.params['id'];
    if (this.asesorId) {
      this.isEditMode = true;
      this.loadAsesorData(this.asesorId);
    }
  }

  private loadAsesorData(id: string): void {
    this.loading = true;
    this.asesorService.getAsesorById(id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.asesorData = data;
        this.patchForm();
      },
      error: () => this.notification.error('Error al cargar los datos del asesor')
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.maxLength(180)]],
      tipoDocumento: [ETipoDocumento.CI, Validators.required],
      nroDocumento: ['', [Validators.required, Validators.maxLength(30)]],
      complemento: ['', [Validators.maxLength(20)]],
      tipo: [EAsesorType.EMPLEADO],
      genero: [EGenero.MASCULINO, Validators.required],
      fechaNacimiento: [null],
      estadoCivil: [null, [Validators.required]],
      ocupacion: ['', [Validators.required, Validators.maxLength(150)]],
      telefono: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.email]],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  private patchForm(): void {
    if (!this.asesorData) return;

    const birthDate = this.asesorData.fechaNacimiento ? new Date(this.asesorData.fechaNacimiento) : null;

    this.form.patchValue({
      ...this.asesorData,
      fechaNacimiento: birthDate
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.warning('Complete los campos requeridos');
      return;
    }

    this.loading = true;
    const value = this.form.value;

    const payload = {
      ...value,
      email: value.email ? value.email : null,
      fechaNacimiento: value.fechaNacimiento ? new Date(value.fechaNacimiento).toISOString() : null
    };

    const request$ = this.isEditMode && this.asesorId
      ? this.asesorService.updateAsesor(this.asesorId, payload)
      : this.asesorService.createAsesor(payload);

    request$.pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.notification.success(this.isEditMode ? 'Asesor actualizado' : 'Asesor creado');
        this.goBack();
      },
      error: (err) => {
        if (err.status === 409) {
          this.notification.error('El documento ya existe');
        } else {
          const msg = err.error?.message || 'Error al guardar';
          this.notification.error(msg);
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/asesores']); // Ajustar según la ruta base real
  }
}
