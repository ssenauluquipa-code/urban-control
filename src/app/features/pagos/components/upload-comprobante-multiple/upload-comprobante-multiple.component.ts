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

import { PagosService } from 'src/app/core/services/pagos.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { IPagoComprobante } from 'src/app/core/models/pagos.model';
import { ImageDisplayMultipleComponent } from 'src/app/shared/components/atoms/image-display-multiple/image-display-multiple.component';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';

@Component({
  selector: 'app-upload-comprobante-multiple',
  standalone: true,
  imports: [
    CommonModule, 
    NzIconModule, 
    ImageDisplayMultipleComponent, 
    ModalContainerComponent
  ],
  templateUrl: './upload-comprobante-multiple.component.html',
  styleUrl: './upload-comprobante-multiple.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadComprobanteMultipleComponent implements OnInit, AfterViewInit {
  public activeModal = inject(NgbActiveModal);
  private pagosService = inject(PagosService);
  private notification = inject(NotificationService);  
  private cdr = inject(ChangeDetectorRef);

  // Referencia para controlar el estado visual del componente hijo
  @ViewChild('imageDisplay') imageDisplayComponent!: ImageDisplayMultipleComponent;

  @Input() pagoId!: string;
  @Input() codigoPago!: string;

  public loading = false;
  
  // Tipado estricto usando la interfaz de tu modelo de pagos
  private mapaComprobantesServidor: IPagoComprobante[] = [];
  private totalArchivosPrevios = 0;

  ngOnInit(): void {
    if (!this.pagoId) {
      this.notification.error('No se proporcionó un ID de pago válido.');
      this.activeModal.dismiss();
    }
  }

  ngAfterViewInit(): void {
    this.cargarComprobantesExistentes();
  }

  /**
   * ACCIÓN 1: GET - Recupera la lista de archivos adjuntos del servidor
   */
  cargarComprobantesExistentes(): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.pagosService.listarComprobantes(this.pagoId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res: IPagoComprobante[]) => {
          this.mapaComprobantesServidor = res || [];
          this.totalArchivosPrevios = this.mapaComprobantesServidor.length;

          if (this.imageDisplayComponent) {
            // Seteamos el estado interno de la galería con los datos persistidos
            this.imageDisplayComponent.fileList = this.mapaComprobantesServidor.map(item => {
              // Evaluamos usando publicUrl y originalName según tu contrato IPagoComprobante
              const esPdf = item.publicUrl?.endsWith('.pdf') || item.originalName?.endsWith('.pdf');
              
              return {
                uid: item.id,
                name: item.originalName || 'Comprobante',
                status: 'done',
                url: item.publicUrl,
                ['thumbUrl']: esPdf ? 'assets/icons/pdf-placeholder.svg' : item.publicUrl,
                // Conservamos el mock inmutable con el nombre correcto
                originFileObj: new File([], item.originalName || 'Comprobante') 
              };
            });
            
            // Forzamos el renderizado del hijo con arquitectura OnPush
            const hijoCdr = (this.imageDisplayComponent as any).cdr;
            if (hijoCdr) {
              hijoCdr.markForCheck();
            }
          }
        },
        error: () => {
          this.notification.error('Error al recuperar los comprobantes del servidor.');
        }
      });
  }

  // Campos para almacenar cambios pendientes hasta que el usuario confirme
  private pendingUploads: File[] = [];
  private pendingDeletions: string[] = [];

  onFilesChanged(archivosActuales: any[]): void {
    // Ya no usamos este evento para calcular.
    // Calcularemos todo en onSave() leyendo el fileList del componente hijo directamente
    // porque el evento filesChanged emite un File[] nativo sin los UIDs.
  }

  /**
   * Ejecuta todas las operaciones pendientes cuando el usuario confirma.
   */
  onSave(): void {

    const currentFiles = this.imageDisplayComponent?.fileList || [];
    const serverIds = new Set(this.mapaComprobantesServidor.map(x => x.id));
    const currentIds = new Set(currentFiles.map(f => f.uid));

    // 1️⃣ Identificar Subidas (archivos cuyo UID no existe en el servidor original)
    const uploads = currentFiles
      .filter(f => !serverIds.has(f.uid))
      .map(f => f.originFileObj as File)
      .filter(f => !!f); // Asegurar que tengamos el objeto File válido

    // 2️⃣ Identificar Eliminaciones (IDs del servidor que ya no están en la vista actual)
    const deletions = this.mapaComprobantesServidor
      .map(x => x.id)
      .filter(id => !currentIds.has(id));

    // Subidas pendientes
    if (uploads.length) {
      uploads.forEach(file => this.ejecutarSubida(file));
    }

    // Eliminaciones pendientes
    if (deletions.length) {
      this.pagosService.eliminarComprobantes(this.pagoId, deletions)
        .pipe(finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: () => {
            this.notification.success('Comprobantes eliminados correctamente.');
            this.cargarComprobantesExistentes();
          },
          error: (err) => {
            this.notification.error('Error al eliminar comprobantes del servidor.');
          }
        });
    }

    // Cerramos el modal
    this.activeModal.close(true);
  }

  /**
   * ACCIÓN 2: POST - Registra de inmediato el binario en la base de datos
   */
  private ejecutarSubida(file: File): void {
    this.loading = true;
    this.cdr.markForCheck();

    const formData = new FormData();
    formData.append('comprobantes', file, file.name);

    this.pagosService.agregarComprobantes(this.pagoId, formData)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.notification.success('Comprobante adjuntado y guardado con éxito.');
          this.cargarComprobantesExistentes();
        },
        error: (err) => {
          console.error('[ejecutarSubida] Error al subir:', err);
          const errorMsg = err.error?.message || 'No se pudo subir el archivo de comprobante.';
          this.notification.error(errorMsg);
          this.cargarComprobantesExistentes();
        }
      });
  }

  /**
   * ACCIÓN 3: DELETE - Evalúa qué ID se quitó del hijo y lo borra en el servidor
   */
  private ejecutarEliminacion(): void {
    if (!this.imageDisplayComponent || !this.imageDisplayComponent.fileList) return;

    // Obtenemos los uids que el componente hijo conserva en pantalla
    const uidsRestantes = this.imageDisplayComponent.fileList.map(f => f.uid);

    // Encontramos el archivo del mapa que ya no figura en la UI del componente hijo
    const destinoBorrado = this.mapaComprobantesServidor.find(item => !uidsRestantes.includes(item.id));

    if (!destinoBorrado) return;

    this.loading = true;
    this.cdr.markForCheck();

    this.pagosService.eliminarComprobantes(this.pagoId, [destinoBorrado.id])
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.notification.success('Comprobante eliminado correctamente.');
          this.cargarComprobantesExistentes();
        },
        error: () => {
          this.notification.error('Error al intentar eliminar el comprobante del servidor.');
          this.cargarComprobantesExistentes();
        }
      });
  }
}