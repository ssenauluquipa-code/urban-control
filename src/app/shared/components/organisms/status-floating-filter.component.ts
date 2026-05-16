import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IFloatingFilterAngularComp } from 'ag-grid-angular';
import { IFloatingFilterParams, TextFilterModel } from 'ag-grid-community';


/**
 * Interfaz que extiende los parámetros base del filtro flotante de AG Grid.
 * Añade la propiedad `onStatusChange` para permitir comunicación directa
 * con el componente padre (ej: ListaAsesoresComponent) sin pasar por el modelo interno de AG Grid.
 */
export interface StatusFloatingFilterParams extends IFloatingFilterParams<unknown, TextFilterModel> {
  /** Callback ejecutado cuando el usuario selecciona un nuevo estado */
  onStatusChange?: (status: boolean | undefined) => void;
}

/**
 * Filtro flotante personalizado para seleccionar estados (Activo/Inactivo/Todos).
 * Se integra en la cabecera de la columna de AG Grid y delega la responsabilidad
 * del filtrado al componente padre mediante un callback.
 */
@Component({
  selector: 'app-status-floating-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="custom-floating-filter">
      <select class="ag-custom-select" [(ngModel)]="currentValue" (change)="onValueChange()">
        <option value="all">Todos</option>
        <option value="true">Activo</option>
        <option value="false">Inactivo</option>
      </select>
    </div>
  `,
  styles: [`
    .custom-floating-filter {
      display: flex;
      align-items: center;
      width: 100%;
      height: 100%;
    }
    .ag-custom-select {
      width: 100%;
      height: 30px; /* Misma altura que los inputs nativos de AG Grid */
      font-size: var(--ag-font-size, 13px);
      color: var(--ag-data-color, #181d1f);
      background-color: var(--ag-background-color, #fff);
      border: 1px solid var(--ag-border-color, #babfc7);
      border-radius: var(--ag-border-radius, 4px);
      padding: 0 8px;
      outline: none;
      cursor: pointer;
      appearance: auto;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }
    .ag-custom-select:focus {
      border-color: var(--ag-input-focus-border-color, #007bff);
      box-shadow: var(--ag-input-focus-box-shadow, 0 0 0 0.2rem rgba(0,123,255,.25));
    }
  `]
})
export class StatusFloatingFilterComponent implements IFloatingFilterAngularComp {
  params!: StatusFloatingFilterParams;
  currentValue = 'all';

  /**
   * Método del ciclo de vida de AG Grid.
   * Se ejecuta al instanciar el filtro flotante.
   */
  agInit(params: StatusFloatingFilterParams): void {
    this.params = params;
  }

  /**
   * Método invocado por AG Grid cuando cambia el modelo del filtro padre.
   * Sirve para sincronizar el estado visual del `<select>` si los filtros se limpian o modifican externamente.
   */
  onParentModelChanged(parentModel: TextFilterModel | null): void {
    if (!parentModel) {
      this.currentValue = 'all';
    } else {
      this.currentValue = parentModel.filter ?? 'all';
    }
  }

  /**
   * Evento disparado desde el HTML cuando el usuario cambia el valor del `<select>`.
   * 
   * 1. Si existe onStatusChange (Remoto), lo llama.
   * 2. Si es Local, notifica al filtro padre de AG Grid usando setModel.
   */
  onValueChange(): void {
    const valueStr = this.currentValue === 'all' ? null : this.currentValue;

    // DIAGNÓSTICO: Ver qué columnas existen realmente en la tabla
    /*    const allCols = this.params.api.getAllGridColumns();
       console.log('StatusFloatingFilter: Enviando ->', valueStr);
       console.log('Columnas disponibles en el Grid:', allCols.map(c => c.getColId()));
    */
    // 1. Compatibilidad con búsqueda remota
    if (this.params?.onStatusChange) {
      const boolValue = this.currentValue === 'true' ? true : (this.currentValue === 'false' ? false : undefined);
      this.params.onStatusChange(boolValue);
    }

    // 2. Compatibilidad con búsqueda local (Vía Instancia de Filtro)
    // Usamos 'any' para evitar errores de compilación por versiones de AG Grid
    const gridApi = this.params.api as any;
    const filterMethod = gridApi.getColumnFilterInstance ? gridApi.getColumnFilterInstance.bind(gridApi) : gridApi.getFilterInstance.bind(gridApi);

    if (filterMethod) {
      filterMethod('isActive').then((instance: any) => {
        if (instance) {
          instance.setModel(valueStr ? {
            filterType: 'text',
            type: 'equals',
            filter: valueStr
          } : null);

          // Sincronizar y refrescar
          this.params.api.onFilterChanged();
        } else {
          console.warn('No se encontró instancia de filtro para la columna "isActive"');
        }
      });
    } else {
      console.error('No se encontró ningún método para obtener instancias de filtros en el API de AG Grid');
    }
  }
}