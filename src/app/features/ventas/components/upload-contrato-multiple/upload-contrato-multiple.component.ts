import { 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  Component, 
  inject, 
  Input, 
  OnInit, 
  AfterViewInit, 
  ViewChild 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { finalize } from 'rxjs';

import { VentaService } from 'src/app/core/services/venta.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { IContratoVenta } from 'src/app/core/models/venta.model';
import { ImageDisplayMultipleComponent } from 'src/app/shared/components/atoms/image-display-multiple/image-display-multiple.component';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';

@Component({
  selector: 'app-upload-contrato-multiple',
  standalone: true,
  imports: [
    CommonModule, 
    NzIconModule, 
    ImageDisplayMultipleComponent, 
    ModalContainerComponent
  ],
  templateUrl: './upload-contrato-multiple.component.html',
  styleUrl: './upload-contrato-multiple.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadContratoMultipleComponent implements OnInit, AfterViewInit {
  public activeModal = inject(NgbActiveModal);
  private ventaService = inject(VentaService);
  private notification = inject(NotificationService);  
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('imageDisplay') imageDisplayComponent!: ImageDisplayMultipleComponent;

  @Input() ventaId!: string;
  @Input() nroVenta!: number | string;

  public loading = false;
  
  private mapaContratosServidor: IContratoVenta[] = [];
  private totalArchivosPrevios = 0;

  ngOnInit(): void {
    if (!this.ventaId) {
      this.notification.error('No se proporcionó un ID de venta válido.');
      this.activeModal.dismiss();
    }
  }

  ngAfterViewInit(): void {
    this.cargarContratosExistentes();
  }

  /**
   * GET - Recupera la lista de contratos del servidor
   */
  cargarContratosExistentes(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.ventaService.listarContratos(this.ventaId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res: IContratoVenta[]) => {
          this.mapaContratosServidor = res || [];
          this.totalArchivosPrevios = this.mapaContratosServidor.length;

          if (this.imageDisplayComponent) {
            this.imageDisplayComponent.fileList = this.mapaContratosServidor.map(item => {
              const esPdf = item.publicUrl?.endsWith('.pdf') || item.originalName?.endsWith('.pdf') || item.mimeType === 'application/pdf';
              
              return {
                uid: item.id,
                name: item.originalName || 'Contrato',
                status: 'done',
                url: item.publicUrl,
                ['thumbUrl']: esPdf ? 'assets/icons/pdf-placeholder.svg' : item.publicUrl,
                originFileObj: new File([], item.originalName || 'Contrato') 
              };
            });
            
            const hijoCdr = (this.imageDisplayComponent as any).cdr;
            if (hijoCdr) {
              hijoCdr.markForCheck();
            }
          }
        },
        error: () => {
          this.notification.error('Error al recuperar los contratos del servidor.');
        }
      });
  }

  /**
   * Ejecuta todas las operaciones pendientes cuando el usuario confirma.
   */
  onSave(): void {
    const currentFiles = this.imageDisplayComponent?.fileList || [];
    const serverIds = new Set(this.mapaContratosServidor.map(x => x.id));
    const currentIds = new Set(currentFiles.map(f => f.uid));

    // 1. Identificar nuevos archivos para subir
    const uploads = currentFiles
      .filter(f => !serverIds.has(f.uid))
      .map(f => f.originFileObj as File)
      .filter(f => !!f);

    // 2. Identificar archivos eliminados
    const deletions = this.mapaContratosServidor
      .map(x => x.id)
      .filter(id => !currentIds.has(id));

    if (uploads.length === 0 && deletions.length === 0) {
      this.activeModal.close(false);
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    // Lógica secuencial o paralela para aplicar cambios
    if (deletions.length > 0 && uploads.length > 0) {
      // Eliminar y luego subir
      this.ventaService.eliminarContratos(this.ventaId, deletions).subscribe({
        next: () => {
          this.ejecutarSubida(uploads);
        },
        error: () => {
          this.loading = false;
          this.notification.error('Error al actualizar contratos.');
          this.cdr.markForCheck();
        }
      });
    } else if (deletions.length > 0) {
      this.ventaService.eliminarContratos(this.ventaId, deletions).subscribe({
        next: () => {
          this.loading = false;
          this.notification.success('Contratos eliminados correctamente.');
          this.activeModal.close(true);
        },
        error: () => {
          this.loading = false;
          this.notification.error('Error al eliminar contratos.');
          this.cdr.markForCheck();
        }
      });
    } else if (uploads.length > 0) {
      this.ejecutarSubida(uploads);
    }
  }

  private ejecutarSubida(archivos: File[]): void {
    this.ventaService.subirContratos(this.ventaId, archivos)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.notification.success('Contratos actualizados correctamente.');
          this.activeModal.close(true);
        },
        error: (err) => {
          const errMsg = err?.error?.message || 'Error al subir los contratos al servidor.';
          this.notification.error(errMsg);
        }
      });
  }
}
