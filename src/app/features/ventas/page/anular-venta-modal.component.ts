import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { VentaService } from 'src/app/core/services/venta.service';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';

/** Modal de confirmación para anular una venta. */
@Component({
  selector: 'app-anular-venta-modal',
  standalone: true,
  imports: [CommonModule, ModalContainerComponent],
  template: `
    <app-modal-container
      [mainTitleModal]="'Anular Venta'"
      [saveButtonName]="'Anular Venta'"
      [saveButtonIcon]="'stop'"
      [saveButtonDanger]="true"
      [loading]="loading"
      (SaveAction)="confirmarAnulacion()"
      (CancelAction)="activeModal.dismiss()"
    >
      <div class="py-2">
        <p class="mb-2 text-dark">
          ¿Estás seguro de anular la venta
          <strong>#{{ nroVenta || '---' }}</strong>?
        </p>
        <p class="mb-0 text-muted small">
          Esta acción solo debería ejecutarse cuando la venta cumple las
          condiciones de anulación definidas por el sistema.
        </p>
      </div>
    </app-modal-container>
  `,
  styles: ``,
})
export class AnularVentaModalComponent {
  @Input() ventaId = '';
  @Input() nroVenta?: number;

  loading = false;

  public activeModal = inject(NgbActiveModal);
  private ventaService = inject(VentaService);
  private notification = inject(NotificationService);

  /** Llama al API de anulación y cierra el modal si tiene éxito. */
  confirmarAnulacion(): void {
    if (!this.ventaId) {
      this.notification.error('No se encontró el identificador de la venta.');
      return;
    }

    this.loading = true;
    this.ventaService
      .anularVenta(this.ventaId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.notification.success('Venta anulada exitosamente.');
          this.activeModal.close(true);
        },
        error: (err) => {
          const message =
            err.error?.message || 'No se pudo anular la venta.';
          this.notification.error(message);
        },
      });
  }
}
