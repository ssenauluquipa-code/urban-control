import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectDataComponent } from './select-data.component';

@Component({
  selector: 'app-select-expedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectDataComponent],
  template: `
    <app-select-data
      [label]="label"
      [inputControl]="inputControl"
      [itemList]="departamentos"
      bindLabel="label"
      bindValue="value"
      [placeholder]="placeholder"
      [searchable]="true"
      [clearable]="false"
      (ChangeValue)="ChangeValue.emit($event)"
    >
    </app-select-data>
  `
})
export class SelectExpedidoComponent {
  @Input() inputControl = new FormControl<string | null>(null);
  @Input() label?: string;
  @Input() placeholder = 'Seleccione departamento...';

  @Output() ChangeValue = new EventEmitter<string>();

  // Lista estática de departamentos de Bolivia
  public departamentos = [
    { value: 'LP', label: 'La Paz (LP)' },
    { value: 'CH', label: 'Chuquisaca (CH)' },
    { value: 'CB', label: 'Cochabamba (CB)' },
    { value: 'OR', label: 'Oruro (OR)' },
    { value: 'PO', label: 'Potosí (PO)' },
    { value: 'TJ', label: 'Tarija (TJ)' },
    { value: 'SC', label: 'Santa Cruz (SC)' },
    { value: 'BE', label: 'Beni (BE)' },
    { value: 'PD', label: 'Pando (PD)' }
  ];
}