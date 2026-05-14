import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/core/services/venta.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DetailVentaViewComponent } from '../../views/detail-venta-view/detail-venta-view.component';
import { IVentaDetalle, IVentaCuota } from 'src/app/core/models/venta.model';
import { finalize, forkJoin } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-detail-venta',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DetailVentaViewComponent],
  template: `
    <app-page-container
      [title]="'Detalle de Venta #' + (venta?.nroVenta || '')"
      [showSave]="false"
      [showCancel]="true"
      [loading]="loading"
      (Cancel)="goBack()"
    >
      <app-detail-venta-view
        [venta]="venta"
        [cuotas]="cuotas"
        [loading]="loading"
      ></app-detail-venta-view>
    </app-page-container>
  `,
  styles: []
})
export class DetailVentaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ventaService = inject(VentaService);
  private notification = inject(NotificationService);

  public venta: IVentaDetalle | null = null;
  public cuotas: IVentaCuota[] = [];
  public loading = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadData(id);
      }
    });
  }

  private loadData(id: string): void {
    this.loading = true;

    // Usamos forkJoin para cargar ambos servicios en paralelo
    forkJoin({
      venta: this.ventaService.obtenerVentaPorId(id),
      cuotas: this.ventaService.obtenerCuotasPorVenta(id)
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.venta = res.venta;
          this.cuotas = res.cuotas;
        },
        error: () => {
          this.notification.error('Error al cargar los detalles de la venta');
          this.goBack();
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/ventas']);
  }
}
