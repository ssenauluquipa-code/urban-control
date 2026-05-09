import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DiaSemanaPago } from 'src/app/core/models/venta.model';
import { SelectDataComponent } from '../atoms/select-data.component';

@Component({
  selector: 'app-select-dia-semana',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectDataComponent],
  template: `
    <div class="d-flex flex-column gap-1">
      <app-select-data
        [itemList]="diaOptions"
        [inputControl]="input_control"
        [placeholder]="input_placeholder"
        [bindValue]="'value'"
        [bindLabel]="'label'"
        [searchable]="false"
        [clearable]="false"
        (ChangeValue)="onSelectionChange($event)"
      >
      </app-select-data>
    </div>
  `
})
export class SelectDiaSemanaComponent {
  @Input() input_control = new FormControl<DiaSemanaPago | null>(null);
  @Input() input_placeholder = 'Seleccionar día...';

  @Output() SelectionChange = new EventEmitter<DiaSemanaPago>();

  /**
   * Mapeamos el Enum dinámicamente para generar las opciones.
   * Usamos una función para formatear el label (ej: "LUNES" -> "Lunes")
   */
  public diaOptions = Object.values(DiaSemanaPago).map(value => ({
    value: value,
    label: value.charAt(0) + value.slice(1).toLowerCase()
  }));

  onSelectionChange(value: DiaSemanaPago | null): void {
    if (value) {
      this.SelectionChange.emit(value);
    }
  }
}