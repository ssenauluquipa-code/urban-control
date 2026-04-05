import { Component, Input, EventEmitter, Output, ChangeDetectionStrategy, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-image-display',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
  ],
  templateUrl: './image-display.component.html',
  styleUrl: './image-display.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageDisplayComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /** URL de la imagen desde la BD */
  @Input() imageUrl?: string;

  /** Nombre/alt de la imagen */
  @Input() imageName = 'Imagen';

  /** Texto cuando no hay imagen */
  @Input() emptyText = 'Sin imagen';

  /** Subtexto cuando no hay imagen y es editable */
  @Input() emptyHint = 'Click para subir imagen';

  /** Icono del estado vacío */
  @Input() emptyIcon = 'file-image';

  /** Si se permiten acciones de editar/eliminar */
  @Input() editable = false;

  /** Tipos MIME aceptados al reemplazar */
  @Input() acceptTypes = 'image/png,image/jpeg,image/jpg,image/webp';

  /** Tamaño máximo en MB */
  @Input() maxSizeMB = 5;

  /** Emite el File nuevo cuando el usuario reemplaza la imagen */
  @Output() imageUpdated = new EventEmitter<File>();

  /** Emite cuando el usuario elimina la imagen */
  @Output() imageDeleted = new EventEmitter<void>();

  /** Signal para preview temporal (antes de guardar) */
  previewUrl = signal<string>('');

  /** URL efectiva: preview temporal o la de BD */
  get displayUrl(): string {
    return this.previewUrl() || this.imageUrl || '';
  }

  /**
   * Abre el selector de archivos nativo
   */
  triggerUpload(event: Event): void {
    event.stopPropagation();
    this.fileInput?.nativeElement.click();
  }

  /**
   * Maneja el archivo seleccionado desde el input nativo
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      console.warn('Solo se permiten imágenes');
      return;
    }

    // Validar tamaño
    if (file.size > this.maxSizeMB * 1024 * 1024) {
      console.warn(`El archivo no puede exceder ${this.maxSizeMB}MB`);
      return;
    }

    // Generar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Emitir el archivo al padre
    this.imageUpdated.emit(file);

    // Resetear el input para permitir seleccionar el mismo archivo otra vez
    input.value = '';
  }

  /**
   * Elimina la imagen
   */
  deleteImage(event: Event): void {
    event.stopPropagation();
    this.previewUrl.set('');
    this.imageDeleted.emit();
  }

  /**
   * Click en el contenedor vacío (solo si es editable)
   */
  onEmptyClick(): void {
    if (this.editable) {
      this.fileInput?.nativeElement.click();
    }
  }
}
