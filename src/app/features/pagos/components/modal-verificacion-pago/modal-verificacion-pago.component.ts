import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { IClientePagoById } from 'src/app/core/models/venta.model';

@Component({
  selector: 'app-modal-verificacion-pago',
  standalone: true,
  imports: [CommonModule, ModalContainerComponent],
  templateUrl: './modal-verificacion-pago.component.html',
  styleUrl: './modal-verificacion-pago.component.scss',
})
export class ModalVerificacionPagoComponent {
  @Input() loteInfo = '';
  @Input() cuotasTexto = '';
  @Input() totalTexto = '';
  @Input() ventaSeleccionada: IClientePagoById | null = null;

  constructor(public activeModal: NgbActiveModal) {}

  confirmar(): void {
    this.activeModal.close(true);
  }

  cancelar(): void {
    this.activeModal.dismiss();
  }
}
