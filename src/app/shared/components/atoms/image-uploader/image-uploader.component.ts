import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzProgressModule } from 'ng-zorro-antd/progress';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  imports: [
    CommonModule,
    NzUploadModule,
    NzButtonModule,
    NzIconModule,
    NzProgressModule,
  ],
  templateUrl: './image-uploader.component.html',
  styleUrl: './image-uploader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageUploaderComponent {
  /** Texto principal del área de upload */
  @Input() uploadTitle = 'Click o arrastra para subir imagen';

  /** Subtexto con indicaciones */
  @Input() uploadHint = 'PNG, JPG hasta 5MB (Recomendado: 400×400px)';

  /** Tamaño máximo del archivo en MB */
  @Input() maxSizeMB = 5;

  /** Tipos MIME aceptados */
  @Input() acceptTypes = 'image/png,image/jpeg,image/jpg,image/webp';

  /** URL de preview inicial (por si ya existe una imagen guardada) */
  @Input() set initialPreview(url: string) {
    if (url) {
      this.previewUrl.set(url);
    }
  }

  /** Icono del área vacía */
  @Input() uploadIcon = 'cloud-upload';

  /** Emite el File seleccionado */
  @Output() imageSelected = new EventEmitter<File>();

  /** Emite cuando se limpia la imagen */
  @Output() imageCleared = new EventEmitter<void>();

  // Signals reactivos
  previewUrl = signal<string>('');
  fileName = signal<string>('');
  uploadProgress = signal<number>(0);
  fileList: NzUploadFile[] = [];

  /**
   * Intercepta el archivo antes de que nz-upload lo suba.
   * Retornamos false para manejar la lógica manualmente.
   */
  beforeUpload = (file: NzUploadFile): boolean => {
    const rawFile = file as unknown as File;

    // Validar tipo
    if (!rawFile.type?.startsWith('image/')) {
      console.warn('Solo se permiten imágenes PNG, JPG, JPEG, WEBP');
      return false;
    }

    // Validar tamaño
    if (rawFile.size > this.maxSizeMB * 1024 * 1024) {
      console.warn(`El archivo no puede exceder ${this.maxSizeMB}MB`);
      return false;
    }

    this.handleImagePreview(rawFile);
    return false; // Evitar upload automático
  };

  /**
   * Genera el preview y emite el archivo
   */
  private handleImagePreview(file: File): void {
    this.simulateProgress();

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl.set(e.target?.result as string);
      this.fileName.set(file.name);
      this.imageSelected.emit(file);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Simula una barra de progreso visual
   */
  private simulateProgress(): void {
    this.uploadProgress.set(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 95) progress = 95;
      this.uploadProgress.set(Math.floor(progress));

      if (progress >= 95) {
        clearInterval(interval);
        setTimeout(() => this.uploadProgress.set(100), 300);
        setTimeout(() => this.uploadProgress.set(0), 800);
      }
    }, 150);
  }

  /**
   * Confirma la imagen seleccionada
   */
  confirmImage(): void {
    // Re-emitir en caso de que el padre quiera escuchar en este momento
    // (la imagen ya fue emitida en handleImagePreview)
  }

  /**
   * Limpia la imagen y resetea el estado
   */
  clearImage(): void {
    this.fileList = [];
    this.previewUrl.set('');
    this.fileName.set('');
    this.uploadProgress.set(0);
    this.imageCleared.emit();
  }
}
