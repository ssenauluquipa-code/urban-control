import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Moneda } from 'src/app/core/models/reserva.model';
import { SelectDataComponent } from "./select-data.component";

@Component({
  selector: 'app-select-moneda',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="monedaList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'value'"
      [bindLabel]="'label'"

      (ChangeValue)="onSelect($event)">
    </app-select-data>
  `,
  styles: ``
})
export class SelectMonedaComponent {

  @Input() inputControl = new FormControl();

  // Input para el placeholder (texto por defecto)
  @Input() placeholder = 'Moneda';

  // Output para emitir cambios si es necesario
  @Output() Change = new EventEmitter<string | null>();

  public monedaList = [
    { value: Moneda.BS, label: 'Bolivianos (BS)' },
    { value: Moneda.USD, label: 'Dólares (USD)' }
  ];

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }
}
