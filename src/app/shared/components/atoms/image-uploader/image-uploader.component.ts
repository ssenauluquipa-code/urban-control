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
  @Input() uploadTitle = 'Click o arrastra para subir imagen';
  @Input() uploadHint = 'PNG, JPG hasta 5MB';
  @Input() maxSizeMB = 5;
  @Input() acceptTypes = 'image/png,image/jpeg,image/jpg,image/webp';
  @Input() uploadIcon = 'cloud-upload';

  // 🆕 INPUTS NUEVOS
  @Input() multiple = false; // Permite seleccionar varios archivos en el diálogo
  @Input() showLocalPreview = true; // Si es false, emite el archivo y resetea el componente (ideal para galerías)

  @Input() set initialPreview(url: string) {
    if (url) this.previewUrl.set(url);
  }

  @Output() imageSelected = new EventEmitter<File>();
  @Output() imageCleared = new EventEmitter<void>();

  previewUrl = signal<string>('');
  fileName = signal<string>('');
  uploadProgress = signal<number>(0);
  fileList: NzUploadFile[] = [];

  beforeUpload = (file: NzUploadFile): boolean => {
    const rawFile = file as unknown as File;

    if (!rawFile.type?.startsWith('image/')) return false;
    if (rawFile.size > this.maxSizeMB * 1024 * 1024) return false;

    this.handleImagePreview(rawFile);
    return false;
  };

  private handleImagePreview(file: File): void {
    this.simulateProgress();

    const reader = new FileReader();
    reader.onload = (e) => {

      if (this.showLocalPreview) {
        // Modo Avatar: Muestra preview y se queda quieto
        this.previewUrl.set(e.target?.result as string);
        this.fileName.set(file.name);
      } else {
        // Modo Galería: Emite el archivo, resetea y permite seguir subiendo
        this.previewUrl.set('');
        this.fileName.set('');
      }

      this.imageSelected.emit(file);
    };
    reader.readAsDataURL(file);
  }

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

  clearImage(): void {
    this.fileList = [];
    this.previewUrl.set('');
    this.fileName.set('');
    this.uploadProgress.set(0);
    this.imageCleared.emit();
  }
}