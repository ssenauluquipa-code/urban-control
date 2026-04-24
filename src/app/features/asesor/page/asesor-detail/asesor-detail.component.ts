import { Component, Input, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { IAsesor } from 'src/app/core/models/asesor/asesor.model';
import { AsesorService } from 'src/app/core/services/asesor.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ViewAsesorDetailComponent } from "../../views/view-asesor-detail/view-asesor-detail.component";
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalContainerComponent } from "src/app/shared/components/organisms/modal-container/modal-container.component";

@Component({
  selector: 'app-asesor-detail',
  standalone: true,
  imports: [ViewAsesorDetailComponent, CommonModule, ModalContainerComponent],
  template: `
    <app-modal-container
      [mainTitleModal]="'Detalle del Asesor'"
      [loading]="loading"
      [showFooter]="false"
      (CancelAction)="activeModal.dismiss()">

      @if (asesor) {
        <app-view-asesor-detail [asesor]="asesor"></app-view-asesor-detail>
      }

    </app-modal-container>
  `,
  styles: ``
})
export class AsesorDetailComponent implements OnInit {

  @Input() asesorId = '';

  asesor: IAsesor | null = null;
  loading = true;
  constructor(
    public activeModal: NgbActiveModal,
    private asesorService: AsesorService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadAsesor();
  }

  loadAsesor(): void {
    if (!this.asesorId) return;

    this.loading = true;
    this.asesorService.getAsesorById(this.asesorId).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => this.asesor = data,
      error: () => {
        this.notification.error('Error al cargar detalles');
        this.activeModal.dismiss();
      }
    });
  }

}
