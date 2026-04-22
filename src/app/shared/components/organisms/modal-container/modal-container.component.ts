import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DragModalDirective } from '../../directives/drag-modal.directive';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, NgbModalModule, NzIconModule, NzButtonModule, DragModalDirective],
  templateUrl: './modal-container.component.html',
  styleUrl: './modal-container.component.scss'
})
export class ModalContainerComponent {
  /** Titulo principal de la ventana modal */
  @Input({ required: true }) mainTitleModal = '';
  @Input() subtitle?: string;
  @Input() loading = false;

  // Configuración de Footer
  @Input() showFooter = true;
  @Input() saveButtonName = "Guardar";
  @Input() saveButtonIcon = "save";
  @Input() cancelButtonName = "Cancelar";

  @Output() SaveAction = new EventEmitter<void>();
  @Output() CancelAction = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) { }
}
