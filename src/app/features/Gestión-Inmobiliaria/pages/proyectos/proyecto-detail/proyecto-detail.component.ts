import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { ViewProyectoDetailComponent } from '../../../views/proyectos/view-proyecto-detail/view-proyecto-detail.component';


@Component({
  selector: 'app-proyecto-detail',
  standalone: true,
  imports: [CommonModule, ModalContainerComponent, ViewProyectoDetailComponent],
  template: `
    <app-modal-container
      [mainTitleModal]="'Detalles del Proyecto'"
      [loading]="loading"
      [showFooter]="false"
      (CancelAction)="activeModal.dismiss()">
        <app-view-proyecto-detail [proyecto]="proyecto" [loading]="loading"></app-view-proyecto-detail>      
    </app-modal-container>
  `,
  styles: []
})
export class ProyectoDetailComponent implements OnInit {

  @Input() proyectoId = '';

  proyecto: IProyecto | null = null;
  loading = true;

  constructor(
    public activeModal: NgbActiveModal,
    private proyectoService: ProyectoService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProyecto();
  }

  loadProyecto(): void {
    if (!this.proyectoId) return;

    this.loading = true;
    this.proyectoService.getProyectoById(this.proyectoId).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => this.proyecto = data,
      error: () => {
        this.notification.error('Error al cargar detalles del proyecto');
        this.activeModal.dismiss();
      }
    });
  }
}
