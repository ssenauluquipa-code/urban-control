import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

/**
 * BadgeEstadoComponent
 *
 * Componente genérico para renderizar estados.
 * Funciona de DOS formas:
 *
 * 1️⃣ Como cellRenderer de AG Grid (columnDefs):
 *    { field: 'isActive', headerName: 'Estado', cellRenderer: BadgeEstadoComponent }
 *
 * 2️⃣ Como componente Angular en cualquier template:
 *    <app-badge-estado [estado]="'DISPONIBLE'"></app-badge-estado>
 *    <app-badge-estado [estado]="true"></app-badge-estado>
 *
 * Estados soportados:
 *  - Booleanos: true → "Activo" | false → "Inactivo"
 *  - Lotes:     DISPONIBLE | RESERVADO | VENDIDO | BLOQUEADO
 *  - Reservas:  ACTIVA | VENCIDA | CONVERTIDA | CANCELADA
 *  - Proyectos: ACTIVO | INACTIVO
 */
@Component({
  selector: 'app-badge-estado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-estado.component.html',
  styleUrls: ['./badge-estado.component.scss']
})
export class BadgeEstadoComponent implements ICellRendererAngularComp {
  label = '';
  cssClass = '';

  // ── Uso en template Angular: <app-badge-estado [estado]="'DISPONIBLE'">
  @Input() set estado(value: string | boolean | null | undefined) {
    this.setState(value);
  }

  // ── Uso como cellRenderer de AG Grid
  agInit(params: ICellRendererParams): void {
    this.setState(params.value);
  }

  refresh(params: ICellRendererParams): boolean {
    this.setState(params.value);
    return true;
  }

  private setState(value: string | boolean | null | undefined): void {
    if (value === true) {
      this.label = 'Activo';
      this.cssClass = 'activo';
    } else if (value === false) {
      this.label = 'Inactivo';
      this.cssClass = 'inactivo';
    } else if (typeof value === 'string') {
      this.label = value;
      // Convertimos a minúsculas para que coincida con las clases del SCSS
      this.cssClass = value.toLowerCase();
    } else {
      this.label = '-';
      this.cssClass = '';
    }
  }
}
