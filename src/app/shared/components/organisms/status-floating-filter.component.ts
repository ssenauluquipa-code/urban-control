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
   * Parsea el string ('true', 'false', 'all') a booleano y emite el valor
   * llamando a la función `onStatusChange` inyectada en los parámetros.
   */
  onValueChange(): void {
    let value: boolean | undefined = undefined;
    if (this.currentValue === 'true') value = true;
    if (this.currentValue === 'false') value = false;

    // Comunicación directa con la pantalla, 100% type-safe sin 'any'
    if (this.params?.onStatusChange) {
      this.params.onStatusChange(value);
    }
  }
}