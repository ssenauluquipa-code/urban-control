import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FrecuenciaPago } from 'src/app/core/models/venta.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SelectDataComponent } from '../atoms/select-data.component';
import { Component, EventEmitter, Input, OnInit, Output, DestroyRef, inject } from '@angular/core';

@Component({
  selector: 'app-select-frecuencia-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SelectDataComponent],
  template: `
    <div class="d-flex flex-column gap-1">
      <app-select-data
        [itemList]="frecuenciaOptions"
        [inputControl]="input_control"
        [placeholder]="input_placeholder"
        [bindValue]="'value'"
        [bindLabel]="'label'"
        [searchable]="false"
        (ChangeValue)="onSelectionChange($event)"
      >
      </app-select-data>
    </div>
  `
})
export class SelectFrecuenciaPagoComponent implements OnInit {
  @Input() input_control = new FormControl<FrecuenciaPago | null>(FrecuenciaPago.MENSUAL);
  @Input() input_placeholder = 'Seleccionar Frecuencia...';

  // Output tipado para emitir el valor seleccionado al padre
  @Output() SelectionChange = new EventEmitter<FrecuenciaPago>();

  private destroyRef = inject(DestroyRef);

  public frecuenciaOptions = Object.values(FrecuenciaPago).map(val => ({
    value: val,
    label: val
  }));

  ngOnInit(): void {
    // Escuchamos cambios internos del control por si se setea programáticamente
    this.input_control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (value) this.SelectionChange.emit(value);
      });
  }

  /**
   * Captura el cambio desde el SelectDataComponent y lo emite
   */
  onSelectionChange(value: FrecuenciaPago | null): void {
    if (value) {
      this.SelectionChange.emit(value);
    }
  }
}