import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-status-filter',
  standalone: true,
  imports: [],
  template: `
    
    <div class="btn-group" role="group">
      <!-- Botón Activos -->
      <button
        type="button"
        class="btn btn-sm"
        [class.btn-primary]="currentStatus === true"
        [class.btn-outline-secondary]="currentStatus !== true"
        (click)="onSelect(true)"
      >
        Activos
      </button>

      <!-- Botón Inactivos -->
      <button
        type="button"
        class="btn btn-sm"
        [class.btn-primary]="currentStatus === false"
        [class.btn-outline-secondary]="currentStatus !== false"
        (click)="onSelect(false)"
      >
        Inactivos
      </button>

      <!-- Botón Todos -->
      <button
        type="button"
        class="btn btn-sm"
        [class.btn-primary]="currentStatus === undefined"
        [class.btn-outline-secondary]="currentStatus !== undefined"
        (click)="onSelect(undefined)"
      >
        Todos
      </button>
    </div>

  `,
  styles: `
    .btn-group .btn {
      min-width: 70px; /* Ancho mínimo para que se vean uniformes */
    }
  `
})
export class StatusFilterComponent {

  /**
   * Valor actual del filtro.
   * Acepta: true (Activos), false (Inactivos), undefined (Todos)
   */
  @Input() currentStatus: boolean | undefined = true;

  /**
   * Emite el nuevo valor seleccionado cuando el usuario hace clic.
   */
  @Output() statusChange = new EventEmitter<boolean | undefined>();

  onSelect(value: boolean | undefined): void {
    this.statusChange.emit(value);
  }
}
