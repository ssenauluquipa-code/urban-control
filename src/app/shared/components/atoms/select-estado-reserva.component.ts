import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { EstadoReserva } from 'src/app/core/models/reserva.model';
import { SelectDataComponent } from "./select-data.component";

@Component({
  selector: 'app-select-estado-reserva',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="estadoList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'value'"
      [bindLabel]="'label'"
      (ChangeValue)="onSelect($event)">
    </app-select-data>
  `
})
export class SelectEstadoReservaComponent {
  @Input() inputControl = new FormControl();
  @Input() placeholder = 'Estado de Reserva';
  @Output() Change = new EventEmitter<string | null>();

  public estadoList = [
    { value: EstadoReserva.ACTIVA, label: 'Activa' },
    { value: EstadoReserva.VENCIDA, label: 'Vencida' },
    { value: EstadoReserva.CONVERTIDA, label: 'Convertida' },
    { value: EstadoReserva.CANCELADA, label: 'Cancelada' }
  ];

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }
}
