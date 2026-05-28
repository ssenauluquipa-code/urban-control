import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { finalize } from 'rxjs';
import { IVentaCuota } from 'src/app/core/models/venta.model';
import { VentaService } from 'src/app/core/services/venta.service';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';

export interface ICuotaCronogramaVisual {
  id: string;
  nroCuota: number;
  fechaVencimiento: string | Date;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: 'PAGADO' | 'PARCIAL' | 'PENDIENTE' | 'VENCIDO';
  isSeleccionadaEfectiva: boolean; // Flag visual para el sombreado dinámico
}

@Component({
  selector: 'app-plan-cuotas-cronograma',
  standalone: true,
  imports: [CommonModule, CardContainerComponent, BadgeEstadoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './plan-cuotas-cronograma.component.html',
  styleUrl: './plan-cuotas-cronograma.component.scss',
})
export class PlanCuotasCronogramaComponent implements OnChanges {
  private ventaService = inject(VentaService);
  private cdr = inject(ChangeDetectorRef);

  @Input() ventaId: string | null = null;
  @Input() montoFormulario = 0; //Recibe el monto actual escrito a mano o calculado
  @Input() moneda = 'USD'; // Recibe la moneda del contrato
  @Output() onMontoCalculado = new EventEmitter<number>(); //Emite el nuevo total acumulado al padre
  @Output() onCuotaSeleccionada = new EventEmitter<ICuotaCronogramaVisual | null>(); // 🔥 Emite la cuota seleccionada
  @Output() onCuotasSeleccionadas = new EventEmitter<ICuotaCronogramaVisual[]>(); // 🔥 Emite el listado completo de cuotas seleccionadas

  cuotas: ICuotaCronogramaVisual[] = [];
  loading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ventaId']) {
      this.loadCuotasIfNeeded();
    }
    // 🔥 Si cambia el monto del formulario, recalculamos la selección visual de los bloques
    if (changes['montoFormulario'] && !changes['montoFormulario'].firstChange) {
      this.marcarCuotasPorMonto(this.montoFormulario);
    }
  }

  /**
   * Al hacer clic en una cuota, acumulamos los saldos pendientes desde la primera
   * hasta la cuota seleccionada para sugerir el pago exacto.
   * Si se hace clic en la última cuota seleccionada, se deselecciona esa cuota.
   */
  seleccionarCuotaHasta(indexSeleccionado: number): void {
    if (this.loading || this.cuotas.length === 0) return;

    // Buscamos el último índice seleccionado actualmente
    const lastSelectedIndex = this.cuotas.map((c) => c.isSeleccionadaEfectiva).lastIndexOf(true);

    let nuevoIndexLimite = indexSeleccionado;

    // Si el usuario hace clic exactamente en la última cuota seleccionada, la deseleccionamos
    if (indexSeleccionado === lastSelectedIndex) {
      nuevoIndexLimite = indexSeleccionado - 1;
    }

    let acumulado = 0;
    if (nuevoIndexLimite >= 0) {
      for (let i = 0; i <= nuevoIndexLimite; i++) {
        acumulado += this.cuotas[i].saldoPendiente;
      }
      this.onMontoCalculado.emit(acumulado);
      this.onCuotaSeleccionada.emit(this.cuotas[nuevoIndexLimite]);
    } else {
      // Si se deseleccionan todas
      this.onMontoCalculado.emit(0);
      this.onCuotaSeleccionada.emit(null);
    }
  }

  /**
   * Recorre las cuotas de forma secuencial simulando la amortización FIFO
   * para marcar visualmente cuáles se verían afectadas por el monto ingresado.
   */
  private marcarCuotasPorMonto(monto: number): void {
    let saldoRestante = monto;

    this.cuotas = this.cuotas.map((cuota) => {
      if (saldoRestante < 0.01) {
        return { ...cuota, isSeleccionadaEfectiva: false };
      }

      saldoRestante -= cuota.saldoPendiente;
      return { ...cuota, isSeleccionadaEfectiva: true };
    });

    const seleccionadas = this.cuotas.filter(c => c.isSeleccionadaEfectiva);
    this.onCuotasSeleccionadas.emit(seleccionadas);

    this.cdr.markForCheck();
  }

  private loadCuotasIfNeeded(): void {
    if (!this.ventaId) {
      this.cuotas = [];
      this.onCuotasSeleccionadas.emit([]);
      return;
    }

    this.loading = true;
    this.ventaService
      .obtenerCuotasPorVenta(this.ventaId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.marcarCuotasPorMonto(this.montoFormulario);
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.cuotas = data.map((c) => this.mapCuota(c));
        },
        error: () => {
          this.cuotas = [];
        },
      });
  }

  private mapCuota(c: IVentaCuota): ICuotaCronogramaVisual {
    return {
      id: c.id,
      nroCuota: c.nroCuota,
      fechaVencimiento: c.fechaVencimiento,
      montoTotal: c.monto,
      montoPagado: c.montoPagado,
      saldoPendiente: c.saldoPendiente,
      estado: c.estado as ICuotaCronogramaVisual['estado'],
      isSeleccionadaEfectiva: false,
    };
  }
}
