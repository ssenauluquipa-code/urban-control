import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { IPagoDetalle } from 'src/app/core/models/pagos.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PagosService } from 'src/app/core/services/pagos.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { InfoPagosViewComponent } from '../view/info-pagos-view/info-pagos-view.component';

@Component({
  selector: 'app-info-pagos',
  standalone: true,
  imports: [PageContainerComponent, InfoPagosViewComponent],
  template: `
    
    <app-page-container [title]="'Información del Pago'" [showOptions]="false" [showBack]="true">
      <app-info-pagos-view [pagoDetalle]="pagoDetalle" [loading]="loading" (onBack)="goBack()"></app-info-pagos-view>
    </app-page-container>

  `,
  styles: ``
})
export class InfoPagosComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pagoService = inject(PagosService);
  private notification = inject(NotificationService);

  pagoDetalle: IPagoDetalle | null = null;
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.loadPago();
  }

  private loadPago(): void {
    const pagoId = this.route.snapshot.paramMap.get('id');

    if (!pagoId) {
      this.notification.error('Id de pago no proporcionado');
      //this.goBack();
      return;
    }

    this.pagoService.obtenerPagoPorId(pagoId).pipe(finalize(() => this.loading = false)
    ).subscribe({
      next: (response) => {
        this.pagoDetalle = response;
      },
      error: () => {
        this.notification.error('Error al obtener el pago');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/pagos']);
  }
}
