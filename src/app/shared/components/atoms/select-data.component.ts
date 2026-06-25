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
        [addTag]="addTagProp"
        [inputAttrs]="{ autocomplete: 'chrome-off', ariaAutocomplete: 'none' }"
        (blur)="Blur.emit($event)"
        (change)="onSelectChange($event)"
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

        <ng-template ng-label-tmp let-item="item" let-clear="clear">
          @if (customLabelTemplate) {
            <ng-container
              *ngTemplateOutlet="
                customLabelTemplate;
                context: { $implicit: item, clear: clear, label: item[bindLabel] }
              "
            ></ng-container>
          } @else {
            <span class="ng-value-label">{{ item[bindLabel] }}</span>
            <span class="ng-value-icon right" (click)="clear(item)" aria-hidden="true">×</span>
          }
        </ng-template>

        
        <ng-template ng-notfound-tmp let-searchTerm="searchTerm">
          <div class="p-2 small text-muted">
            No hay resultados para "{{ searchTerm }}"
          </div>
        </ng-template>

        <ng-template ng-tag-tmp let-searchTerm="searchTerm">
          <div class="p-2 border-top bg-light">
            <span class="text-primary fw-bold">
              <i class="ph ph-plus-circle me-1"></i>
              Crear nuevo: <b>{{ searchTerm }}</b>
            </span>
          </div>
        </ng-template>
      </ng-select>

      <app-input-error-messages
        [input_control]="inputControl"
        [minLength]="minLength"
        [maxLength]="maxLength"
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

  @Input() customLabelTemplate?: TemplateRef<{
    $implicit: T;
    clear: (item: T) => void;
    label: string;
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
  @Input() addTag: boolean | ((term: string) => unknown) = false;

  @Input() minLength = 0;
  @Input() maxLength = 0;
  @Input() proyectoId: string | null = null;
  // CORREGIDO: Emitimos el tipo específico del valor del control
  @Output() ChangeValue = new EventEmitter<string | T | null>();
  @Output() SelectionChange = new EventEmitter<T | T[] | null>();
  @Output() Blur = new EventEmitter<FocusEvent>();
  @Output() Search = new EventEmitter<string>();
  @Output() AddTag = new EventEmitter<string>();

  ngOnInit(): void {
    if (this.defaultValue) {
      this.inputControl.setValue(this.defaultValue);
    }
    if (this.setFocus) {
      setTimeout(() => this.inputSelect.focus(), 100);
    }
  }

  onSelectChange(item: T | T[] | null): void {
    // Emitimos el valor tipado del control
    this.ChangeValue.emit(this.inputControl.value);
    this.SelectionChange.emit(item);

    // Quitamos el foco para que desaparezca el puntero |
    if (this.inputSelect) {
      this.inputSelect.blur();
    }
  }

  /**
   * Propiedad computada para manejar addTag.
   * Si es true, usamos una función interna para emitir el evento y retornar null
   * (evitando que ng-select añada el tag automáticamente antes de que el modal lo cree).
   */
  get addTagProp(): boolean | ((term: string) => unknown) {
    if (typeof this.addTag === 'function') {
      return this.addTag;
    }
    if (this.addTag === true) {
      return (term: string) => {
        this.AddTag.emit(term);

        // Cerrar el dropdown y limpiar búsqueda para mejorar UX
        if (this.inputSelect) {
          this.inputSelect.close();
          this.inputSelect.searchTerm = '';
        }

        return null; // No añadir el tag directamente a la lista
      };
    }
    return false;
  }
}