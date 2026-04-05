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
  @Input({ required: true }) mainTitleModal: string = '';
  @Input() subtitle?: string;
  @Input() loading: boolean = false;
  
  // Configuración de Footer
  @Input() showFooter: boolean = true;
  @Input() saveButtonName: string = "Guardar";
  @Input() saveButtonIcon: string = "save";
  @Input() cancelButtonName: string = "Cancelar";
  
  @Output() onSaveAction = new EventEmitter<void>();
  @Output() onCancelAction = new EventEmitter<void>();

  constructor(public activeModal: NgbActiveModal) {}
}
