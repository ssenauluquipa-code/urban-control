// src/app/shared/components/atoms/select-bolivia/select-departamento.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BOLIVIA_UBICACION } from 'src/app/core/constants/bolivia-data';
import { SelectDataComponent } from './select-data.component';

@Component({
  selector: 'app-select-departamento',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="departamentos"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'nombre'"
      [bindLabel]="'nombre'"
      [searchable]="true"
      (ChangeValue)="onSelect($event)">
    </app-select-data>
  `
})
export class SelectDepartamentoComponent {
  @Input() inputControl = new FormControl<string | null>(null);
  @Input() placeholder = 'Seleccione Departamento';
  @Output() Change = new EventEmitter<string | null>();

  public departamentos = BOLIVIA_UBICACION;

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }
}