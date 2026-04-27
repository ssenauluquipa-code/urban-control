import { Component } from '@angular/core';
import { IFilterAngularComp } from 'ag-grid-angular';
import { IDoesFilterPassParams, IFilterParams, TextFilterModel } from 'ag-grid-community';

@Component({
  selector: 'app-status-filter',
  standalone: true,
  template: ``
})
export class StatusFilterComponent implements IFilterAngularComp {
  params!: IFilterParams;
  model: TextFilterModel | null = null;

  agInit(params: IFilterParams): void {
    this.params = params;
  }

  isFilterActive(): boolean {
    return this.model !== null;
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    if (!this.model) return true;
    
    // Obtenemos el valor real de la celda (booleano)
    const value = this.params.getValue(params.node);
    
    // Lo comparamos con el modelo que inyectó el floating filter
    if (this.model.filter === 'true') return value === true;
    if (this.model.filter === 'false') return value === false;
    
    return true;
  }

  getModel(): TextFilterModel | null {
    return this.model;
  }

  setModel(model: TextFilterModel | null): void {
    this.model = model;
  }
}
