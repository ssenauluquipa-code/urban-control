import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, of } from 'rxjs';
import { CreateLoteDto, ILote } from 'src/app/core/models/lote/lote.model';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ViewRegisterLotesComponent } from '../../views/lotes/view-register-lotes/view-register-lotes.component';

@Component({
  selector: 'app-register-lotes',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent, // Usamos el template de página
    ViewRegisterLotesComponent
  ],
  template: `
    <app-page-container
      [title]="isEditMode ? 'Editando Lote #' + (loteData?.numero || '') : 'Registrar Nuevo Lote'"
      permissionScope="lotes"
      [showSave]="true"
      [showCancel]="true"
      (Save)="onSave()"
      (Cancel)="onCancel()"
    >
      <!-- Aquí inyectamos tu vista existente -->
      <app-view-register-lotes
        [loteForm]="loteFormGroup"
        [loteData]="loteData"
        [pendingFiles]="pendingFiles"   
        (fileSelected)="onFileSelected($event)"
        (removePendingFile)="onRemovePending($event)"
        (deleteImage)="onDeleteImage($event)"
      ></app-view-register-lotes>
    </app-page-container>
  `,
  styles: ``
})
export class RegisterLotesComponent implements OnInit {

  public loteFormGroup!: FormGroup;
  public loteData: ILote | null = null;
  public isEditMode = false;

  private manzanaId: string | null = null;
  public pendingFiles: File[] = [];

  // Inyecciones
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loteService = inject(LoteService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    this.buildForm();
    this.loadInitialData();
  }

  private buildForm(): void {
    this.loteFormGroup = this.fb.group({
      manzanaId: [null, Validators.required],
      numero: [null, [Validators.required, Validators.min(1)]],
      areaM2: [null, [Validators.required, Validators.min(0)]],
      precioReferencial: [null],
      dimensionNorte: [null],
      dimensionSur: [null],
      dimensionEste: [null],
      dimensionOeste: [null],
      comision: [null, [Validators.max(100)]],
      observaciones: ['']
    });
  }

  private loadInitialData(): void {
    // Detectar si es Edición (param :id)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.loteService.getLoteById(id).subscribe(data => {
          this.loteData = data;
          this.loteFormGroup.patchValue(data);
        });
      }
    });

    // Detectar si es Creación (queryParam ?manzanaId=...)
    this.route.queryParamMap.subscribe(params => {
      const mId = params.get('manzanaId');
      if (mId && !this.isEditMode) {
        this.manzanaId = mId;
        this.loteFormGroup.get('manzanaId')?.setValue(mId);
      }
    });
  }

  // --- Eventos ---

  public onFileSelected(files: File): void {
    this.pendingFiles.push(files);
    //this.notification.info(`${files.length} archivo(s) listo(s) para subir.`);
  }
  // 🚀 Método para quitar un archivo de la lista pendiente
  public onRemovePending(index: number): void {
    this.pendingFiles.splice(index, 1);
  }

  public onDeleteImage(imageId: string): void {
    if (!this.loteData) return;
    this.loteService.deleteLoteImages(this.loteData.id, [imageId]).subscribe({
      next: () => {
        this.notification.success('Imagen eliminada');
        // Refrescamos los datos para actualizar la galería
        this.loteService.getLoteById(this.loteData!.id).subscribe(data => this.loteData = data);
      },
      error: () => this.notification.error('Error al eliminar')
    });
  }

  public onSave(): void {
    if (this.loteFormGroup.invalid) {
      this.loteFormGroup.markAllAsTouched();
      this.notification.warning('Complete los campos requeridos');
      return;
    }

    const formValue = this.loteFormGroup.getRawValue();

    // MODO EDICIÓN
    if (this.isEditMode && this.loteData) {
      // MODO EDICIÓN
      const loteId = this.loteData.id; // Tomamos el ID de la variable del componente

      // Preparamos el payload limpio (sin ID, sin manzanaId según tu endpoint)
      const payload = { ...formValue };
      delete payload['id']; // Por seguridad, aunque no exista
      delete payload['manzanaId']; // El endpoint PATCH no suele requerir cambiar la manzana

      this.loteService.updateLote(loteId, payload).pipe(
        switchMap(() => this.pendingFiles.length > 0 ? this.loteService.uploadLoteImages(loteId, this.pendingFiles) : of(true))
      ).subscribe({
        next: () => { this.notification.success('Actualizado'); this.onCancel(); },
        error: () => this.notification.error('Error al actualizar')
      });
    }
    // MODO CREACIÓN
    else {
      const payload: CreateLoteDto = formValue as CreateLoteDto;
      this.loteService.createLote(payload).pipe(
        switchMap((newLote: ILote) => this.pendingFiles.length > 0 ? this.loteService.uploadLoteImages(newLote.id, this.pendingFiles) : of(newLote))
      ).subscribe({
        next: () => { this.notification.success('Lote creado'); this.onCancel(); },
        error: (err) => {
          if (err.status === 409) this.notification.error('El lote ya existe');
          else this.notification.error('Error inesperado');
        }
      });
    }
  }

  public onCancel(): void {
    this.router.navigate(['/gestion-inmobiliaria/lotes']);
  }
}