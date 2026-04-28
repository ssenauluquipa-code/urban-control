import { Component } from '@angular/core';
import { SelectClientesComponent } from "../atoms/select-clientes.component";
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IClienteFloatingFilterParams } from '../../interfaces/table-filters.interface';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IFloatingFilterParams, TextFilterModel } from 'ag-grid-community';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente-floating-filter-wrapper',
  standalone: true,
  imports: [SelectClientesComponent, ReactiveFormsModule, CommonModule],
  template: `
    <div class="filter-wrapper">
      <app-select-clientes
        [inputControl]="clienteControl"
        placeholder="Filtrar cliente..."
        (Change)="onClienteSelected($event)">
      </app-select-clientes>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .filter-wrapper {
      width: 100%;
      padding: 0 4px; /* Un pequeño margen para que no choque con los bordes */
      display: flex;
      align-items: center;
    }

    /* Forzamos que los subcomponentes se expandan */
    app-select-clientes {
      width: 100%;
      display: block;
    }
    
    ::ng-deep app-select-data {
      width: 100%;
      display: block;
    }
    
    ::ng-deep app-select-data .form-group {
      margin-bottom: 0 !important;
    }
  `
})
export class ClienteFloatingFilterWrapperComponent implements IFloatingFilterAngularComp {

  params!: IClienteFloatingFilterParams;
  clienteControl = new FormControl<string | null>(null);

  agInit(params: IFloatingFilterParams): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: TextFilterModel | null): void {
    if (!parentModel) {
      this.clienteControl.setValue(null, { emitEvent: false });
    }
  }

  onClienteSelected(clienteId: string | null) {
    if (this.params.onClienteChange) {
      this.params.onClienteChange(clienteId || undefined);
    }
  }

}
