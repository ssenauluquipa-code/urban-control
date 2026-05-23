import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from 'src/app/core/services/venta.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DetailVentaViewComponent } from '../../views/detail-venta-view/detail-venta-view.component';
import { IVentaDetalle, IVentaCuota, IVentaSaldoResumen } from 'src/app/core/models/venta.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { ILote } from 'src/app/core/models/lote/lote.model';
import { forkJoin, of, switchMap, finalize } from 'rxjs';

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
        [lotes]="lotes"
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
  private loteService = inject(LoteService);
  private notification = inject(NotificationService);

  public venta: IVentaDetalle | null = null;
  public cuotas: IVentaCuota[] = [];
  public saldo: IVentaSaldoResumen | null = null;
  public lotes: ILote | null = null;
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
    this.ventaService.obtenerVentaPorId(id).pipe(
      switchMap(venta => {
        this.venta = venta;
        const loteId = venta?.loteId;
        const cuotas$ = this.ventaService.obtenerCuotasPorVenta(id);
        const saldo$ = this.ventaService.obtenerSaldoPorVenta(id);
        const lote$ = loteId ? this.loteService.getLoteById(loteId) : of(null);
        return forkJoin({ cuotas: cuotas$, saldo: saldo$, lote: lote$ });
      }),
      finalize(() => this.loading = false)
    ).subscribe({
      next: res => {
        this.cuotas = res.cuotas;
        this.saldo = res.saldo;
        this.lotes = res.lote;
      },
      error: err => {
        const message = err?.error?.message ?? 'Error al cargar los detalles de la venta';
        this.notification.error(message);
        this.goBack();
      }
    });
  }

  /** Vuelve al listado de ventas. */
  goBack(): void {
    this.router.navigate(['/ventas']);
  }
}
