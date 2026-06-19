import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { InputErrorMessagesComponent } from '../input-error-messages/input-error-messages.component';

@Component({
  selector: 'app-input-documento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzInputModule, InputErrorMessagesComponent],
  template: `
    <div class="input-group custom-doc-group">
      <input
        type="text"
        inputmode="numeric"
        nz-input
        [formControl]="tempMainControl"
        [placeholder]="placeholder"
        (input)="onValuesChange()"
        (blur)="onBlur()"
        [nzStatus]="input_control.invalid && input_control.touched ? 'error' : ''"
        class="main-input"
      />

      @if (hasComplemento) {
        <span class="input-group-text separator-addon">-</span>
        <input
          type="text"
          nz-input
          [formControl]="tempCompControl"
          placeholder="1B"
          maxlength="2"
          class="complemento-input"
          (input)="onValuesChange()"
          (blur)="onBlur()"
        />
      }
    </div>

    @if (show_error_messages) {
      <app-input-error-messages [input_control]="input_control"></app-input-error-messages>
    }
  `,
  styles: [`
    .custom-doc-group {
      display: flex;
      align-items: stretch;
      width: 100%;
    }

    .main-input {
      flex: 1;
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }

    .separator-addon {
      background-color: #f8f9fa;
      border: 1px solid #d9d9d9;
      border-left: none;
      border-right: none;
      color: #666;
      font-weight: bold;
      display: flex;
      align-items: center;
      padding: 0 4px;
    }

    .complemento-input {
      width: 60px !important;
      text-align: center;
      border-top-left-radius: 0 !important;
      border-bottom-left-radius: 0 !important;
      text-transform: uppercase;
      padding: 4px;
    }

    /* Ajuste para que el borde rojo de error de NG-ZORRO se vea bien en grupo */
    .ant-input-status-error {
      z-index: 2;
    }
  `]
})
export class InputDocumentoComponent implements OnInit {
  @Input() input_control!: FormControl; // El control 'nroDocumento' del form padre
  @Input() hasComplemento = false;
  @Input() placeholder = '1234567';
  @Input() show_error_messages = true;

  // Controles temporales para separar la vista
  public tempMainControl = new FormControl('');
  public tempCompControl = new FormControl('');

  ngOnInit(): void {
    // Si ya hay un valor inicial al cargar (ej. en edición sincrónica)
    this.updateTempControls(this.input_control.value);

    // Escuchar cambios externos (ej. cuando se hace un patchValue después de una petición HTTP)
    this.input_control.valueChanges.subscribe((val) => {
      // Evitar ciclos infinitos si el cambio provino desde este mismo componente
      const main = this.tempMainControl.value || '';
      const comp = this.tempCompControl.value || '';
      const currentFinalValue = comp ? `${main}-${comp}` : main;

      if (val !== currentFinalValue) {
        this.updateTempControls(val);
      }
    });
  }

  private updateTempControls(val: any): void {
    const strVal = val ? String(val) : '';
    if (strVal.includes('-')) {
      const parts = strVal.split('-');
      this.tempMainControl.setValue(parts[0], { emitEvent: false });
      this.tempCompControl.setValue(parts[1], { emitEvent: false });
    } else {
      this.tempMainControl.setValue(strVal, { emitEvent: false });
      this.tempCompControl.setValue('', { emitEvent: false });
    }
  }

  onValuesChange(): void {
    const main = this.tempMainControl.value || '';
    const comp = this.tempCompControl.value?.trim().toUpperCase() || '';

    // Concatenamos para el formulario padre
    const finalValue = comp ? `${main}-${comp}` : main;

    // Actualizamos el control real que se va a la API
    this.input_control.setValue(finalValue, { emitEvent: false });
    this.input_control.markAsDirty();
  }

  onBlur(): void {
    this.input_control.markAsTouched();
  }
}