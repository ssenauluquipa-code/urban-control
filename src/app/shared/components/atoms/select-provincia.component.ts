// src/app/shared/components/atoms/select-bolivia/select-provincia.component.ts
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectDataComponent } from './select-data.component';


@Component({
  selector: 'app-select-provincia',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="provinciasFormateadas"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'nombre'"
      [bindLabel]="'nombre'"
      [searchable]="true"
      [loading]="loading"
      (ChangeValue)="onSelect($event)">
    </app-select-data>
  `
})
export class SelectProvinciaComponent implements OnChanges {
  @Input() inputControl = new FormControl<string | null>(null);
  @Input() provincias: string[] = []; // Recibe el array de strings simple
  @Input() placeholder = 'Seleccione Provincia';
  @Input() loading = false;
  @Output() Change = new EventEmitter<string | null>();

  // El select-data necesita un array de objetos, así que transformamos el array de strings
  public provinciasFormateadas: { nombre: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['provincias']) {
      this.provinciasFormateadas = this.provincias.map(p => ({ nombre: p }));
    }
  }

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }
}