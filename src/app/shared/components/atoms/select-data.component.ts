import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { InputErrorMessagesComponent } from './input-error-messages/input-error-messages.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-data',
  standalone: true,
  imports: [
    CommonModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    InputErrorMessagesComponent,
  ],
  template: `
    <div class="form-group custom-select-container">
      @if (label) {
        <label [for]="selectId" class="form-label fw-bold mb-1">{{
          label
        }}</label>
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
        [appendTo]="'body'"
        (blur)="Blur.emit($event)"
        (change)="onSelectChange()"
        (search)="Search.emit($event.term)"
        (clear)="Search.emit('')"
      >
        <ng-template ng-option-tmp let-item="item" let-search="searchTerm">
          @if (customOptionTemplate) {
            <ng-container
              *ngTemplateOutlet="
                customOptionTemplate;
                context: { $implicit: item, searchTerm: search }
              "
            ></ng-container>
          } @else {
            {{ item[bindLabel] }}
          }
        </ng-template>

        <ng-template ng-notfound-tmp let-searchTerm="searchTerm">
          <div class="p-2 small text-muted">
            No hay resultados para "{{ searchTerm }}"
          </div>
        </ng-template>
      </ng-select>

      <app-input-error-messages
        [input_control]="inputControl"
      ></app-input-error-messages>
    </div>
  `,
  styles: `
   
  `,
})
export class SelectDataComponent<T = unknown> implements OnInit {
  @ViewChild('inputSelect') inputSelect!: NgSelectComponent;

  // TemplateRef tipado con unknown para evitar el uso de any
  @Input() customOptionTemplate?: TemplateRef<{
    $implicit: T;
    searchTerm: string;
  }>;

  public selectId = 'select-' + Math.random().toString(36).substring(2, 9);

  @Input() label?: string;
  @Input() itemList: T[] = [];
  @Input() bindValue = 'id';
  @Input() bindLabel = 'name';
  @Input() placeholder = 'Seleccionar...';
  @Input() loading = false;

  // Tipamos el FormControl para que acepte el valor de bindValue (normalmente string o el objeto T)
  @Input() inputControl = new FormControl<string | T | null>(null);
  @Input() defaultValue: string | T | null = null;

  @Input() clearable = true;
  @Input() searchable = false;
  @Input() isMultiple = false;
  @Input() setFocus = false;

  // CORREGIDO: Emitimos el tipo específico del valor del control
  @Output() ChangeValue = new EventEmitter<string | T | null>();
  @Output() Blur = new EventEmitter<FocusEvent>();
  @Output() Search = new EventEmitter<string>();

  ngOnInit(): void {
    if (this.defaultValue) {
      this.inputControl.setValue(this.defaultValue);
    }
    if (this.setFocus) {
      setTimeout(() => this.inputSelect.focus(), 100);
    }
  }

  onSelectChange(): void {
    // Emitimos el valor tipado del control
    this.ChangeValue.emit(this.inputControl.value);
    
    // Quitamos el foco para que desaparezca el puntero |
    if (this.inputSelect) {
      this.inputSelect.blur();
    }
  }
}