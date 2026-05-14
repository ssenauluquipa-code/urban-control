import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IFloatingFilterParams, TextFilterModel } from 'ag-grid-community';

export interface VentaTipoPagoFloatingFilterParams extends IFloatingFilterParams<unknown, TextFilterModel> {
  // Callback opcional por si se necesita fuera
  onTipoPagoChange?: (tipo: string | undefined) => void;
}

@Component({
  selector: 'app-venta-tipo-pago-floating-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="custom-floating-filter">
      <select class="ag-custom-select" [(ngModel)]="currentValue" (change)="onValueChange()">
        <option value="all">Todos</option>
        <option value="CONTADO">Contado</option>
        <option value="CUOTAS">Cuotas</option>
      </select>
    </div>
  `,
  styles: [`
    .custom-floating-filter { display: flex; align-items: center; width: 100%; height: 100%; }
    .ag-custom-select {
      width: 100%;
      height: 30px;
      font-size: 13px;
      border: 1px solid var(--ag-border-color, #babfc7);
      border-radius: var(--ag-border-radius, 4px);
      padding: 0 8px;
      outline: none;
      cursor: pointer;
      background-color: var(--ag-background-color, #fff);
    }
  `]
})
export class VentaTipoPagoFloatingFilterComponent implements IFloatingFilterAngularComp {
  params!: VentaTipoPagoFloatingFilterParams;
  currentValue = 'all';

  agInit(params: VentaTipoPagoFloatingFilterParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: TextFilterModel | null): void {
    this.currentValue = parentModel?.filter ?? 'all';
  }

  onValueChange(): void {
    const valueStr = this.currentValue === 'all' ? null : this.currentValue;

    // 1. Callback manual si existe
    if (this.params?.onTipoPagoChange) {
      this.params.onTipoPagoChange(valueStr || undefined);
    }

    // 2. Compatibilidad con búsqueda local (Vía API de AG Grid)
    const gridApi = this.params.api as any;
    const currentModel = gridApi.getFilterModel() || {};

    if (valueStr) {
      currentModel['tipoPago'] = {
        filterType: 'text',
        type: 'equals',
        filter: valueStr
      };
    } else {
      delete currentModel['tipoPago'];
    }

    gridApi.setFilterModel(currentModel);
    gridApi.onFilterChanged();
  }
}
