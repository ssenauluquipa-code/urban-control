
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TipoReporteActivo = 'HUB' | 'LOTES' | 'CLIENTES' | 'VENTAS' | 'PAGOS' | 'RESERVAS' | 'CUOTAS_PENDIENTES' | 'MORA' | 'ASESORES';

export interface ITarjetaReporte {
  id: TipoReporteActivo;
  titulo: string;
  descripcion: string;
  categoria: 'comercial' | 'caja' | 'riesgo' | 'auditoria';
  icono: string;
}

@Component({
  selector: 'app-panel-tarjetas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel-tarjetas.component.html',
  styleUrl: './panel-tarjetas.component.scss'
})
export class PanelTarjetasComponent {
  // Recibe la configuración de la tarjeta desde el Hub padre
  @Input({ required: true }) tarjeta!: ITarjetaReporte;

  // Emite el ID seleccionado al hacer clic
  @Output() clickReporte = new EventEmitter<TipoReporteActivo>();

  public onCardClick(): void {
    this.clickReporte.emit(this.tarjeta.id);
  }
}