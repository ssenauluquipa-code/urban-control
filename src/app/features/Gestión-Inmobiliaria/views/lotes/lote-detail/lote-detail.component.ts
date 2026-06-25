import { Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ILote, TEstadoLote } from 'src/app/core/models/lote/lote.model';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { ReservaService } from 'src/app/core/services/reserva.service';
import { VentaService } from 'src/app/core/services/venta.service';
import { IReserva } from 'src/app/core/models/reserva.model';
import { IVenta, IVentaSaldoResumen } from 'src/app/core/models/venta.model';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { CurrencyLabelComponent } from 'src/app/shared/components/atoms/currency-label/currency-label.component';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lote-detail',
  standalone: true,
  imports: [
    CommonModule,
    NzDescriptionsModule,
    NzImageModule,
    NzSpinModule,
    CurrencyLabelComponent,
  ],
  templateUrl: './lote-detail.component.html',
  styleUrl: './lote-detail.component.scss'
})
export class LoteDetailComponent implements OnInit, OnChanges {

  @Input() loteId!: string;
  public lote: ILote | null = null;
  public loading = true;

  // Agrega esta variable para controlar la galería
  public selectedImage: string | null = null;

  // Datos adicionales para lotes reservados o vendidos
  public activeReserva: IReserva | null = null;
  public activeVenta: IVenta | null = null;
  public activeVentaSaldo: IVentaSaldoResumen | null = null;
  public totalCuotas = 0;
  public cuotasPagadas = 0;

  constructor(
    private loteService: LoteService,
    private reservaService: ReservaService,
    private ventaService: VentaService,
    @Optional() private drawerRef: NzDrawerRef,
    @Optional() private activeModal: NgbActiveModal
  ) {
  }

  ngOnInit(): void {
    this.loadDetail();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loteId'] && !changes['loteId'].firstChange) {
      this.loadDetail();
    }
  }

  private loadDetail(): void {
    if (this.loteId) {
      this.loading = true;
      this.selectedImage = null; // Resetear la imagen seleccionada al cambiar de lote
      this.activeReserva = null;
      this.activeVenta = null;
      this.activeVentaSaldo = null;
      this.totalCuotas = 0;
      this.cuotasPagadas = 0;

      this.loteService.getLoteById(this.loteId)
        .subscribe({
          next: (data) => {
            this.lote = data;

            if (data.estado === TEstadoLote.RESERVADO) {
              this.reservaService.getReservas('ACTIVA', undefined, data.manzanaId)
                .subscribe({
                  next: (reservas) => {
                    this.activeReserva = reservas.find(r => r.loteId === data.id) || null;
                    this.loading = false;
                  },
                  error: () => {
                    this.loading = false;
                  }
                });
            } else if (data.estado === TEstadoLote.VENDIDO) {
              this.ventaService.listarVentas(data.manzanaId)
                .subscribe({
                  next: (ventas) => {
                    const venta = ventas.find(v => v.loteId === data.id);
                    if (venta) {
                      this.activeVenta = venta;
                      
                      // Cargar cuotas para contar pagadas
                      this.ventaService.obtenerCuotasPorVenta(venta.ventaId)
                        .subscribe({
                          next: (cuotas) => {
                            this.totalCuotas = cuotas.length;
                            this.cuotasPagadas = cuotas.filter(c => c.estado === 'PAGADO').length;
                          }
                        });

                      this.ventaService.obtenerSaldoPorVenta(venta.ventaId)
                        .subscribe({
                          next: (saldo) => {
                            this.activeVentaSaldo = saldo;
                            this.loading = false;
                          },
                          error: () => {
                            this.loading = false;
                          }
                        });
                    } else {
                      this.loading = false;
                    }
                  },
                  error: () => {
                    this.loading = false;
                  }
                });
            } else {
              this.loading = false;
            }
          },
          error: () => {
            this.loading = false;
          }
        });
    }
  }
  public closeDrawer(): void {
    if (this.drawerRef) {
      this.drawerRef.close();
    } else if (this.activeModal) {
      this.activeModal.dismiss();
    }
  }

  // Helper para colores del estado
  public getStatusBgColor(estado: TEstadoLote): string {
    switch (estado) {
      case TEstadoLote.DISPONIBLE: return '#006c49'; // Verde
      case TEstadoLote.RESERVADO: return '#d97706'; // Naranja
      case TEstadoLote.VENDIDO: return '#dc2626'; // Rojo
      default: return '#6b7280'; // Gris
    }
  }
}
