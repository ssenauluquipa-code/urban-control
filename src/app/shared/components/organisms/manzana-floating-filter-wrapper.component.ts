import { Component } from '@angular/core';
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IManzanaFloatingFilterParams } from '../../interfaces/table-filters.interface';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-manzana-floating-filter-wrapper',
  standalone: true,
  imports: [],
  template: `
    <p>
      manzana-floating-filter-wrapper works!
    </p>
  `,
  styles: ``
})
export class ManzanaFloatingFilterWrapperComponent implements IFloatingFilterAngularComp{

  params!: IManzanaFloatingFilterParams;
  manzanaControl = new FormControl<string | null>(null);

  agInit(params: IManzanaFloatingFilterParams): void {
    this.params = params;

    // Escuchamos los cambios del control para notificar al componente padre (ListVentas)
    this.manzanaControl.valueChanges.subscribe(value => {
      if (this.params.onManzanaChange) {
        this.params.onManzanaChange(value ?? undefined);
      }
    });
  }

  // Se llama cuando el filtro se limpia desde afuera (ej. botón "Limpiar Filtros")
  onParentModelChanged(parentModel: string): void {
    if (!parentModel) {
      this.manzanaControl.setValue(null, { emitEvent: false });
    }
  }
}
