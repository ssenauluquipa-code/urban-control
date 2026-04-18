import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectDataComponent } from './select-data.component';
import { EGenero } from 'src/app/core/models/cliente.model';

@Component({
  selector: 'app-select-gender',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectDataComponent],
  template: `
    <app-select-data
      [itemList]="genderOptions"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'value'"
      [bindLabel]="'label'"
    >
    </app-select-data>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class SelectGenderComponent {

  @Input() inputControl = new FormControl();
  @Input() placeholder = 'Seleccionar Género...';

  public genderOptions = Object.values(EGenero).map(val => ({
    value: val,
    label: val.charAt(0) + val.slice(1).toLowerCase()
  }));

}
