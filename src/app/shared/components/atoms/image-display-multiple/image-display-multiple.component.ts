import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NotificationService } from 'src/app/core/services/notification.service';

const getBase64 = (file: File): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

@Component({
  selector: 'app-image-display-multiple',
  standalone: true,
  imports: [CommonModule, NzUploadModule, NzModalModule, NzIconModule],
  templateUrl: './image-display-multiple.component.html',
  styleUrl: './image-display-multiple.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageDisplayMultipleComponent {
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  @Input() editable = false;
  @Input() maxFiles = 5;
  @Input() maxSizeMB = 5;

  // Emitimos el arreglo nativo de archivos File[] que espera el servicio de pagos
  @Output() filesChanged = new EventEmitter<File[]>();

  @Input() set initialFiles(files: NzUploadFile[]) {
    if (files) {
      this.fileList = [...files];
      this.cdr.markForCheck();
    }
  }

  // Lista interna compatible con la UI de NG-ZORRO
  fileList: NzUploadFile[] = [];
  previewImage: string | undefined = '';
  previewVisible = false;

  /**
   * TRUCO: Detiene la subida automática de NG-ZORRO y guarda el archivo localmente
   */
  beforeUpload = (file: NzUploadFile, _fileList: NzUploadFile[]): boolean => {
    // Extraemos el archivo nativo real de JS, contemplando que NG-ZORRO a veces lo pasa directo en beforeUpload
    const rawFile = (file as any).size ? (file as unknown as File) : file.originFileObj;

    if (!rawFile) {
      this.notification.error('No se pudo procesar el archivo seleccionado.');
      return false;
    }

    // 1. Validar tipo (Imágenes y PDFs)
    const isPdf = rawFile.type === 'application/pdf' || rawFile.name.endsWith('.pdf');
    const isImage = rawFile.type?.startsWith('image/');

    if (!isImage && !isPdf) {
      this.notification.error('Solo se permiten imágenes (PNG, JPG, WEBP) o archivos PDF.');
      return false;
    }

    // 2. Validar tamaño
    const isLtMax = rawFile.size / 1024 / 1024 < this.maxSizeMB;
    if (!isLtMax) {
      this.notification.error(`El archivo no puede exceder los ${this.maxSizeMB}MB.`);
      return false;
    }

    // Aseguramos que el objeto tenga asignadas sus propiedades de objeto origen para NG-ZORRO
    if (!file.originFileObj) {
      file.originFileObj = rawFile;
    }

    // Forzamos el estado a 'done' para habilitar la visualización interactiva
    file.status = 'done';
    
    if (isPdf) {
      file['thumbUrl'] = 'assets/icons/pdf-placeholder.svg'; // Ruta de tu icono PDF
      this.fileList = [...this.fileList, file];
      this.emitirArchivosAlPadre();
      this.cdr.markForCheck();
    } else if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        file['thumbUrl'] = e.target?.result as string; // Asignamos la preview en Base64 real
        
        // Seteamos la lista de manera inmutable para que ChangeDetectionOnPush reaccione
        this.fileList = [...this.fileList, file];
        this.emitirArchivosAlPadre();
        this.cdr.markForCheck(); // Fuerza el ciclo de renderizado de Angular
      };
      reader.readAsDataURL(rawFile);
    }

    return false; // Evita que NG-ZORRO haga el disparo HTTP automático
  };

  /**
   * Maneja la eliminación cuando se hace click en la papelera de la miniatura
   */
  handleRemove = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.filter(f => f.uid !== file.uid);
    this.emitirArchivosAlPadre();
    this.cdr.markForCheck();
    return true;
  };

  /**
   * Maneja el modal de previsualización
   */
  handlePreview = async (file: NzUploadFile): Promise<void> => {
    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      if (file.url) {
        // Archivo que ya existe en el servidor (usa publicUrl)
        window.open(file.url, '_blank');
      } else if (file.originFileObj) {
        // Archivo local nuevo (aún no subido)
        const blobUrl = URL.createObjectURL(file.originFileObj);
        window.open(blobUrl, '_blank');
      }
      return;
    }

    if (!file.url && !file['preview']) {
      file['preview'] = await getBase64(file.originFileObj!) as string;
    }
    
    this.previewImage = file.url || file['preview'];
    this.previewVisible = true;
    this.cdr.markForCheck();
  };

  private emitirArchivosAlPadre(): void {
    const archivosNativos = this.fileList
      .map(f => f.originFileObj)
      .filter((f): f is File => !!f);
    
    this.filesChanged.emit(archivosNativos);
  }
}