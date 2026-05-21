import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/core/services/venta.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DetailVentaViewComponent } from '../../views/detail-venta-view/detail-venta-view.component';
import { IVentaDetalle, IVentaCuota, IVentaSaldoResumen } from 'src/app/core/models/venta.model';
import { finalize, forkJoin } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';

/** Página de detalle: carga venta, cuotas y saldo en paralelo. */
@Component({
  selector: 'app-detail-venta',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DetailVentaViewComponent],
  template: `
    <app-page-container
      [title]="'Detalle de Venta #' + (venta?.nroVenta || '')"
      [showSave]="false"
      [showBack]="true"
      [loading]="loading"
      [showOptions]="false"
      (Back)="goBack()"
    >
      <app-detail-venta-view
        [venta]="venta"
        [cuotas]="cuotas"
        [saldo]="saldo"
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
  public saldo: IVentaSaldoResumen | null = null;
  public loading = false;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadData(id);
      }
    });
  }

  /** Obtiene detalle, plan de cuotas y resumen de saldo por ventaId. */
  private loadData(id: string): void {
    this.loading = true;

    // Usamos forkJoin para cargar ambos servicios en paralelo
    forkJoin({
      venta: this.ventaService.obtenerVentaPorId(id),
      cuotas: this.ventaService.obtenerCuotasPorVenta(id),
      saldo: this.ventaService.obtenerSaldoPorVenta(id)
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this.venta = res.venta;
          this.cuotas = res.cuotas;
          this.saldo = res.saldo;
        },
        error: () => {
          this.notification.error('Error al cargar los detalles de la venta');
          this.goBack();
        }
      });
  }

  /** Vuelve al listado de ventas. */
  goBack(): void {
    this.router.navigate(['/ventas']);
  }
}
