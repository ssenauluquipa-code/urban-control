import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/core/services/notification.service';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { CreateLoteDto, ILote } from 'src/app/core/models/lote/lote.model';
import { ViewRegisterLotesComponent } from '../../views/lotes/view-register-lotes/view-register-lotes.component';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-register-lotes',
  standalone: true,
  imports: [ViewRegisterLotesComponent],
  template: `
    <app-view-register-lotes
      [loteForm]="loteFormGroup"
      [loteData]="loteData"
      (Save)="onSaveLote()"
      (filesSelected)="onFilesSelected($event)"
      (deleteImage)="onDeleteImage($event)"
            ></app-view-register-lotes>
  `,
  styles: ``
})
export class RegisterLotesComponent implements OnInit {

  @Input() loteData: ILote | null = null;
  @Input() manzanaId = '';

  public loteFormGroup!: FormGroup;
  private pendingFiles: File[] = []; // Archivos pendientes de subir (en caso de ser nuevo)

  constructor(
    private fb: FormBuilder,
    private loteService: LoteService,
    private ngModal: NgbActiveModal,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    if (this.loteData) {
      this.loteFormGroup.patchValue(this.loteData);
    } else {
      this.loteFormGroup.get('manzanaId')?.setValue(this.manzanaId);
    }
  }

  private buildForm(): void {
    this.loteFormGroup = this.fb.group({
      id: [null],
      manzanaId: [this.manzanaId, Validators.required],
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

  // 📸 Manejo de archivos seleccionados desde la vista
  onFilesSelected(files: FileList): void {
    this.pendingFiles = Array.from(files);

    // Si ya tenemos un ID (Modo Edición), subimos inmediatamente
    if (this.loteData?.id) {
      this.uploadImages(this.loteData.id);
    } else {
      this.notification.info('Las imágenes se subirán después de guardar el lote.');
    }
  }

  public onSaveLote(): void {
    if (this.loteFormGroup.invalid) {
      this.loteFormGroup.markAllAsTouched();
      this.notification.warning('Revise los campos obligatorios.');
      return;
    }

    const formValue = this.loteFormGroup.getRawValue();
    const isEditMode = !!formValue.id;
    const payload = this.cleanPayload(formValue);

    if (isEditMode) {
      // --- ACTUALIZAR ---
      const updatePayload = { ...payload } as Record<string, unknown>;
      delete updatePayload['id'];
      delete updatePayload['manzanaId'];
      this.loteService.updateLote(formValue.id, updatePayload).subscribe({
        next: (updatedLote) => {
          // Si había archivos pendientes, los subimos ahora
          if (this.pendingFiles.length > 0) {
            this.uploadImages(updatedLote.id);
          } else {
            this.notification.success('Lote actualizado');
            this.ngModal.close(true);
          }
        },
        error: (err) => this.notification.error(err.error?.message || 'Error al actualizar')
      });

    }
    else {
      // --- CREAR ---
      const createPayload: CreateLoteDto = payload as unknown as CreateLoteDto;

      this.loteService.createLote(createPayload).pipe(
        // Si hay imágenes, encadenamos la subida después de crear
        switchMap((newLote: ILote) => {
          if (this.pendingFiles.length > 0) {
            return this.loteService.uploadLoteImages(newLote.id, this.pendingFiles);
          }
          return of(newLote); // Si no hay imágenes, devolvemos el lote creado
        })
      ).subscribe({
        next: () => {
          this.notification.success('Lote creado exitosamente');
          this.ngModal.close(true);
        },
        error: (err) => {
          if (err.status === 409) this.notification.error('Este número de lote ya existe.');
          else this.notification.error('Error al crear lote');
        }
      });
    }
  }
  // 🗑️ Eliminar imagen
  public onDeleteImage(imageId: string): void {
    if (!this.loteData?.id) return;

    // Nota: El backend espera un array de IDs
    this.loteService.deleteLoteImages(this.loteData.id, [imageId]).subscribe({
      next: () => {
        this.notification.success('Imagen eliminada');
        // Actualizamos loteData localmente para que desaparezca de la vista
        // Sin cerrar el modal.
        // Como loteData es Input, necesitamos recargar o manipular el objeto.
        // Idealmente, el servicio devuelve el lote actualizado, aquí simulamos el cambio:
        if (this.loteData && this.loteData.imagenes) {
          // Suponiendo que imagenes es un array de objetos { id, url }
          // this.loteData.imagenes = this.loteData.imagenes.filter(img => img.id !== imageId);
          // Para refrescar la vista, podríamos usar un Subject o simplemente cerrar el modal.
          // Por simplicidad, cerramos y abrimos o recargamos:
          this.ngModal.close(true); // Cerramos para que la lista recargue
        }
      },
      error: () => this.notification.error('Error al eliminar imagen')
    });
  }

  private uploadImages(loteId: string): void {
    this.loteService.uploadLoteImages(loteId, this.pendingFiles).subscribe({
      next: () => {
        this.notification.success('Imágenes guardadas');
        this.pendingFiles = []; // Limpiamos buffer
        this.ngModal.close(true);
      },
      error: () => {
        this.notification.warning('Lote guardado, pero falló la subida de imágenes.');
        this.ngModal.close(true);
      }
    });
  }

  private cleanPayload(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== null && value !== '' && value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }


}