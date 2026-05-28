import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VentaPagoOption } from '../../view/register-pagos-view/register-pagos-view.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-venta-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select-venta-grid.component.html',
  styleUrl: './select-venta-grid.component.scss',
})
export class SelectVentaGridComponent {

  @Input() ventas: VentaPagoOption[] = [];
  @Input() loading = false;
  @Input() currentVentaId: string | null = null;

  @Output() ventaIdChange = new EventEmitter<string>();

  /**
   * Emite el ID de la venta seleccionada al componente padre
   */
  seleccionarVenta(ventaId: string): void {
    // Si hago clic en la que ya está seleccionada, podría querer deseleccionarla (opcional)
    // Por ahora, forzamos la selección.
    this.ventaIdChange.emit(ventaId);
  }
}
