import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILote } from 'src/app/core/models/lote/lote.model';

@Component({
  selector: 'app-lote-visualizer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lote-visualizer.component.html',
  styleUrl: './lote-visualizer.component.scss'
})
export class LoteVisualizerComponent {

  @Input() lotes: ILote[] = [];
  @Input() selectedLoteId: string | null = null; // Para manejar la selección
  @Output() loteClick = new EventEmitter<ILote>();

  // ID del lote seleccionado internamente para el estilo
  private internalSelectedId: string | null = null;
  /**
   * Retorna la clase CSS basada en el estado del lote
   */
  getStatusClass(estado: string): string {
    switch (estado) {
      case 'DISPONIBLE': return 'status-disponible';
      case 'RESERVADO': return 'status-reservado';
      case 'VENDIDO': return 'status-vendido';
      case 'BLOQUEADO': return 'status-bloqueado';
      default: return '';
    }
  }

  /* Retorna el icono SVG o emoji correspondiente al estado
  */
  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'DISPONIBLE': return ''; // Sin icono para disponible
      case 'RESERVADO': return '⏳';
      case 'VENDIDO': return '✓';
      case 'BLOQUEADO': return '🔒';
      default: return '';
    }
  }

  /**
   * Maneja el click y la selección visual
   */
  onLoteClick(lote: ILote): void {
    this.internalSelectedId = lote.id;
    this.loteClick.emit(lote);
  }

  /**
   * Verifica si un lote está seleccionado (vía input o internamente)
   */
  isSelected(lote: ILote): boolean {
    return lote.id === this.selectedLoteId || lote.id === this.internalSelectedId;
  }

  getTooltip(lote: ILote): string {
    return `Lote #${lote.numero} \nÁrea: ${lote.areaM2} m² \nEstado: ${lote.estado} \nPrecio: ${lote.precioReferencial || 'N/A'}`;
  }
}
