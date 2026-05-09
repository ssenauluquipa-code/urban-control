import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-modalidad-calendario-selector',
  standalone: true,
  imports: [CommonModule, NzRadioModule, ReactiveFormsModule],
  template: `
    <div class="d-flex flex-column gap-2 bg-light p-2 rounded border">

      <nz-radio-group 
        [formControl]="input_control" 
        class="d-flex flex-column gap-1">
        
        <label nz-radio [nzValue]="MODALIDADES.INTERVALO_15_DIAS">
          <span class="text-dark fw-medium">Intervalo de 15 días</span>
          <small class="d-block text-muted ms-4">Calcula cuotas cada 15 días desde la fecha inicial.</small>
        </label>

        <label nz-radio [nzValue]="MODALIDADES.DIAS_FIJOS_MES">
          <span class="text-dark fw-medium">Días fijos del mes</span>
          <small class="d-block text-muted ms-4">Vencimientos en días específicos (Ej: 15 y 30).</small>
        </label>

      </nz-radio-group>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    nz-radio-group {
      display: flex;
      flex-direction: column;
    }
  `]
})
export class ModalidadCalendarioSelectorComponent {
  @Input() input_control: FormControl<string | null> = new FormControl<string | null>(null);

  // Output para notificar al padre el cambio de lógica
  @Output() SelectionChange = new EventEmitter<string>();

  // Usamos los valores exactos que definiste para el Enum
  public readonly MODALIDADES = {
    INTERVALO_15_DIAS: 'INTERVALO_15_DIAS',
    DIAS_FIJOS_MES: 'DIAS_FIJOS_MES'
  };

  constructor() {
    this.input_control.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        if (value) {
          this.SelectionChange.emit(value);
        }
      });
  }

}