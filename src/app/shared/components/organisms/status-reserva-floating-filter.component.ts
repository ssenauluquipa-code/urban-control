import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IFloatingFilterParams, TextFilterModel } from 'ag-grid-community';
import { EstadoReserva } from 'src/app/core/models/reserva.model';

/**
 * Interfaz para los parámetros del filtro de Reservas.
 * Usamos el tipo string del Enum para el callback.
 */
export interface StatusReservaFloatingFilterParams extends IFloatingFilterParams<unknown, TextFilterModel> {
  onStatusChange?: (status: string | undefined) => void;
}

@Component({
  selector: 'app-status-reserva-floating-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="custom-floating-filter">
      <select class="ag-custom-select" [(ngModel)]="currentValue" (change)="onValueChange()">
        <option value="all">Todos</option>
        <option [value]="estadoEnum.ACTIVA">Activa</option>
        <option [value]="estadoEnum.CONVERTIDA">Convertida</option>
        <option [value]="estadoEnum.VENCIDA">Vencida</option>
        <option [value]="estadoEnum.CANCELADA">Cancelada</option>
      </select>
    </div>
  `,
  styles: [`
    .custom-floating-filter { display: flex; align-items: center; width: 100%; height: 100%; }
    .ag-custom-select {
      width: 100%;
      height: 30px;
      font-size: 13px;
      border: 1px solid #babfc7;
      border-radius: 4px;
      padding: 0 8px;
      outline: none;
      cursor: pointer;
    }
  `]
})
export class StatusReservaFloatingFilterComponent implements IFloatingFilterAngularComp {
  params!: StatusReservaFloatingFilterParams;
  currentValue = 'all';
  estadoEnum = EstadoReserva;

  agInit(params: StatusReservaFloatingFilterParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: TextFilterModel | null): void {
    this.currentValue = parentModel?.filter ?? 'all';
  }

  onValueChange(): void {
    // Si es 'all', mandamos undefined para que la API traiga todo
    const value = this.currentValue === 'all' ? undefined : this.currentValue;

    if (this.params?.onStatusChange) {
      this.params.onStatusChange(value);
    }
  }
}