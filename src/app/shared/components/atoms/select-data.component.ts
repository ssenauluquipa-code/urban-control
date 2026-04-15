import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { InputErrorMessagesComponent } from "./input-error-messages/input-error-messages.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-data',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule, InputErrorMessagesComponent],
  template: `
    <div class="form-group custom-select-container">
      @if (label) {
        <label [for]="selectId" class="form-label fw-bold mb-1">{{ label }}</label>
      }
      <ng-select
        #inputSelect
        [labelForId]="selectId"
        [items]="itemList"
        [multiple]="isMultiple"
        [bindValue]="bindValue"
        [bindLabel]="bindLabel"
        [clearable]="clearable"
        [searchable]="searchable"
        [placeholder]="placeholder"
        [formControl]="inputControl"
        [loading]="loading"
        [loadingText]="'Cargando...'"
        [notFoundText]="'No se encontraron resultados'"
        [class.is-invalid]="inputControl.invalid && inputControl.touched"
        (blur)="Blur.emit($event)"
        (change)="onSelectChange()">

        <ng-template ng-notfound-tmp let-searchTerm="searchTerm">
          <div class="p-2 small text-muted">
            No hay resultados para "{{searchTerm}}"
          </div>
        </ng-template>
      </ng-select>

      <app-input-error-messages [input_control]="inputControl"></app-input-error-messages>
    </div>
  `,
  styles: `

  .custom-select-container {
      display: block;
      width: 100%;
    }
    .form-label {
      font-size: 0.85rem;
      color: #4a5568;
    }
    /* Estilizamos el ng-select para que encaje con el look de UrbanControl */
    ::ng-deep .ng-select.is-invalid .ng-select-container {
      border-color: #e53e3e !important;
    }

  `
})
export class SelectDataComponent implements OnInit {

  @ViewChild('inputSelect') inputSelect!: NgSelectComponent;

  public selectId = 'select-' + Math.random().toString(36).substring(2, 9);

  // Propiedades de configuración
  @Input() label?: string;
  @Input() itemList: unknown[] = [];
  @Input() bindValue = 'Id';
  @Input() bindLabel = 'Name';
  @Input() placeholder = 'Seleccionar...';
  @Input() loading = false;

  // Control y validación
  @Input() inputControl = new FormControl<unknown>(null);
  @Input() defaultValue: unknown = null;

  // Comportamiento
  @Input() clearable = true;
  @Input() searchable = true;
  @Input() isMultiple = false;
  @Input() setFocus = false;
  @Input() appendToStyle: string | null = null;

  @Output() ChangeValue = new EventEmitter<string | null>();
  @Output() Blur = new EventEmitter<string>();

  ngOnInit(): void {
    if (this.defaultValue) {
      this.inputControl.setValue(this.defaultValue);
    }
    if (this.setFocus) {
      setTimeout(() => this.inputSelect.focus(), 100);
    }
  }

  // Emite el valor real del control (bindValue ya aplicado), no el objeto crudo del ng-select
  onSelectChange(): void {
    this.ChangeValue.emit(this.inputControl.value as string | null);
  }
}
