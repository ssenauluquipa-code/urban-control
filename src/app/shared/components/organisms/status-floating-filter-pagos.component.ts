import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IFloatingFilterParams, TextFilterModel } from 'ag-grid-community';
import { EstadoPago } from 'src/app/core/models/pagos.model';

export interface StatusFloatingFilterPagosParams extends IFloatingFilterParams<unknown, TextFilterModel>{
  onStatusChange?:(status: string | undefined) => void; 
}

@Component({
  selector: 'app-status-floating-filter-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    
    <div class="custom-floating-filter">
      <select class="ag-custom-select" [(ngModel)]="currentValue" (change)="onValueChange()">
        <option value="all">Todos</option>
        <option [value]="estadoEnum.ACTIVO">Activo</option>
        <option [value]="estadoEnum.ANULADO">Anulado</option>                
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
export class StatusFloatingFilterPagosComponent implements IFloatingFilterAngularComp {
  params! : StatusFloatingFilterPagosParams;
  currentValue = 'all';
  estadoEnum = EstadoPago;
  
  agInit(params: StatusFloatingFilterPagosParams): void {
      this.params = params;
    }
  
    onParentModelChanged(parentModel: TextFilterModel): void {
      this.currentValue = parentModel?.filter ?? 'all';    
    }
  
    onValueChange(): void {
          const value = this.currentValue === 'all' ? undefined : this.currentValue;
  
      // 1. Compatibilidad con búsqueda remota (Callback manual)
      if (this.params?.onStatusChange) {
        this.params.onStatusChange(value);
      }
  
      // 2. Compatibilidad con búsqueda local (Vía API de AG Grid)
      const gridApi = this.params.api as any;
      const currentModel = gridApi.getFilterModel() || {};
  
      if (value) {
        currentModel['estado'] = {
          filterType: 'text',
          type: 'equals',
          filter: value
        };
      } else {
        delete currentModel['estado'];
      }
  
      gridApi.setFilterModel(currentModel);
      gridApi.onFilterChanged();
    }
  
}
