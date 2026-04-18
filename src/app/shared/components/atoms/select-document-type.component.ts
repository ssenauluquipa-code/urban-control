import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectDataComponent } from './select-data.component';
import { ETipoDocumento } from 'src/app/core/models/cliente.model';

@Component({
  selector: 'app-select-document-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectDataComponent],
  template: `
    <app-select-data
      [itemList]="docTypeOptions"
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
export class SelectDocumentTypeComponent {

  @Input() inputControl = new FormControl();
  @Input() placeholder = 'Seleccionar Tipo Doc...';

  public docTypeOptions = Object.values(ETipoDocumento).map(val => ({
    value: val,
    label: val
  }));

}
