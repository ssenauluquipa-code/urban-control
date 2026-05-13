import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { finalize } from 'rxjs';
import { ICliente } from 'src/app/core/models/cliente.model';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { ImageDisplayComponent } from 'src/app/shared/components/atoms/image-display/image-display.component';

@Component({
  selector: 'app-cliente-foto-upload',
  standalone: true,
  imports: [
    CommonModule,
    ModalContainerComponent,
    ImageDisplayComponent
  ],
  templateUrl: './cliente-foto-upload.component.html',
  styleUrl: './cliente-foto-upload.component.scss'
})
export class ClienteFotoUploadComponent implements OnInit {
  public activeModal = inject(NgbActiveModal);
  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);

  @Input({ required: true }) cliente!: ICliente;

  public selectedFile: File | null = null;
  public loading = false;

  ngOnInit(): void {
    if (!this.cliente) {
      this.notification.error('No se proporcionó información del cliente');
      this.activeModal.dismiss();
    }
  }

  onImageUpdated(file: File): void {
    this.selectedFile = file;
  }

  onImageDeleted(): void {
    this.selectedFile = null;
  }

  guardarFoto(): void {
    if (!this.selectedFile) return;

    this.loading = true;
    this.clienteService.uploadFoto(this.cliente.id, this.selectedFile)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.notification.success('Foto actualizada correctamente');
          this.activeModal.close(res);
        },
        error: (err) => {
          console.error('Error al subir foto', err);
          const msg = err?.error?.message || 'Error al actualizar la foto';
          this.notification.error(msg);
        }
      });
  }
}
