import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. Importamos las interfaces necesarias
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

export type EstadoLote = 'DISPONIBLE' | 'VENDIDO' | 'RESERVADO';

@Component({
  selector: 'app-badge-estado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-estado.component.html',
  styleUrls: ['./badge-estado.component.scss']
})
// 2. Implementamos ICellRendererAngularComp
export class BadgeEstadoComponent implements ICellRendererAngularComp {
  @Input() estado: EstadoLote = 'DISPONIBLE';

  // 3. Este método recibe el valor desde AG Grid
  agInit(params: ICellRendererParams): void {
    if (params.value) {
      this.estado = params.value;
    }
  }

  // 4. Este método permite que la celda se actualice si el dato cambia
  refresh(params: ICellRendererParams): boolean {
    if (params.value) {
      this.estado = params.value;
      return true;
    }
    return false;
  }

  getBadgeClass(): string {
    return this.estado.toLowerCase();
  }
}
