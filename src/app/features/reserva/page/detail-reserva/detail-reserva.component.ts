
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { IReserva } from 'src/app/core/models/reserva.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ReservaService } from 'src/app/core/services/reserva.service';
import { ViewDetailReservaComponent } from "../../views/view-detail-reserva/view-detail-reserva.component";
import { NzSpinComponent } from "ng-zorro-antd/spin";
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";

@Component({
  selector: 'app-detail-reserva',
  standalone: true,
  imports: [CommonModule, ViewDetailReservaComponent, NzSpinComponent, RouterModule, PageContainerComponent],
  template: `
  <app-page-container title="Detalle de Reserva" [showBack]="true" [showOptions]="false">
  @if (loading) {
      <div class="text-center p-5">
        <nz-spin nzSimple nzSize="large"></nz-spin>
      </div>
    } @else if (reserva) {
      <app-view-detail-reserva [reserva]="reserva"></app-view-detail-reserva>
    }
  </app-page-container>
  `,
  styles: ``
})
export class DetailReservaComponent implements OnInit {

  public reserva: IReserva | null = null;
  public loading = false;

  private route = inject(ActivatedRoute);
  private reservaService = inject(ReservaService);
  private notification = inject(NotificationService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDetail(id);
    } else {
      this.notification.error('ID de reserva no válido');
    }
  }

  private loadDetail(id: string): void {
    this.loading = true;
    this.reservaService.getReservaById(id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => {
        this.reserva = data;
      },
      error: () => this.notification.error('Error al cargar reserva')
    })
  }

}
