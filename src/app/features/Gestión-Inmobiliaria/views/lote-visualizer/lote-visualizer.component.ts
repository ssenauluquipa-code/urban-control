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
  @Output() loteClick = new EventEmitter<ILote>();

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
  /**
 * Calcula la proporción visual (ancho/alto) basándose en las dimensiones.
 * Esto hace que un lote largo se vea largo y uno cuadrado se vea cuadrado.
 */
  getAspectRatio(lote: ILote): string {
    // Promediamos los lados opuestos para obtener ancho y alto promedio
    // Asumimos Norte/Sur = Ancho, Este/Oeste = Largo (profundidad)
    const ancho = ((lote.dimensionNorte || 0) + (lote.dimensionSur || 0)) / 2;
    const alto = ((lote.dimensionEste || 0) + (lote.dimensionOeste || 0)) / 2;

    // Si no hay dimensiones, devolvemos un cuadrado perfecto
    if (ancho === 0 || alto === 0) return '1 / 1';

    // Calculamos la relación simplificada.
    // Para evitar cajas gigantes, normalizamos dividiendo por el menor.
    const menor = Math.min(ancho, alto);
    const ratioW = ancho / menor;
    const ratioH = alto / menor;

    // Limitamos el ratio máximo para que no rompa el layout (ej. max 3:1)
    const finalW = Math.min(3, ratioW);
    const finalH = Math.min(3, ratioH);

    return `${finalW} / ${finalH}`;
  }

  getTooltip(lote: ILote): string {
    return `Lote #${lote.numero} \nÁrea: ${lote.areaM2} m² \nEstado: ${lote.estado} \nPrecio: ${lote.precioReferencial || 'N/A'}`;
  }
}
