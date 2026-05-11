import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EEstadoCivil } from 'src/app/core/models/cliente.model';
import { SelectDataComponent } from './select-data.component';

@Component({
  selector: 'app-select-estado-civil',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule, CommonModule],
  template: `
    <app-select-data
      [itemList]="estadoCivilOptions"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'value'"
      [bindLabel]="'label'"
    >
    </app-select-data>
  `,
  styles: ``
})
export class SelectEstadoCivilComponent {
  @Input() inputControl = new FormControl<string | null>(null);
  @Input() placeholder = 'Estado Civil';

  public estadoCivilOptions = Object.values(EEstadoCivil).map(val => ({
    value: val,
    label: val.charAt(0) + val.slice(1).toLowerCase()
  }));
}
