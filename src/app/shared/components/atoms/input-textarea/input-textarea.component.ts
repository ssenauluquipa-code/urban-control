import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputErrorMessagesComponent } from '../input-error-messages/input-error-messages.component';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NgStyle, NgClass, NgIf } from '@angular/common';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

@Component({
  selector: 'app-input-textarea',
  standalone: true,
  imports: [
    ɵNzTransitionPatchDirective,
    NzInputModule,
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    NgClass,
    NgIf,
    NzIconDirective,
    InputErrorMessagesComponent
  ],
  template: `
    <div class="textarea-wrapper">
      @if (show_character_count && input_maxlength > 0) {
        <nz-textarea-count [nzMaxCharacterCount]="input_maxlength">
          <textarea
            #inputElement
            nz-input
            [rows]="input_rows"
            [nzAutosize]="finalAutosize"
            [nzStatus]="input_control.invalid && input_control.touched ? 'error' : ''"
            [placeholder]="input_placeholder"
            [formControl]="input_control"
            (blur)="onInputBlur($event)"
            [ngClass]="customClass"
          ></textarea>
        </nz-textarea-count>
      } @else {
        <textarea
          #inputElement
          nz-input
          [rows]="input_rows"
          [nzAutosize]="finalAutosize"
          [nzStatus]="input_control.invalid && input_control.touched ? 'error' : ''"
          [placeholder]="input_placeholder"
          [maxlength]="input_maxlength > 0 ? input_maxlength : null"
          [formControl]="input_control"
          (blur)="onInputBlur($event)"
          [ngClass]="customClass"
        ></textarea>
      }

      @if(help_text && input_control.valid){
        <small class="text-success-custom">
          <span nz-icon nzType="check-circle" nzTheme="fill"></span>
          {{help_text}}
        </small>
      }

      @if (show_error_messages) {
        <app-input-error-messages
          [input_control]="input_control"
          [maxLength]="input_maxlength"
          [minLength]="input_minlength"
          [patternValidMessage]="patternValidMessage">
        </app-input-error-messages>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .textarea-wrapper {
      width: 100%;
    }

    textarea.ant-input {
      width: 100%;
      display: block !important;
      min-height: unset !important;
      height: auto !important;
      overflow: auto;
      padding: 8px 12px;
      box-sizing: border-box;
    }

    /* Estilo para el texto de ayuda */
    .text-success-custom {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #52c41a;
    }

    /* Asegura que el contador de NG-ZORRO no rompa el diseño */
    ::ng-deep nz-textarea-count {
      width: 100%;
      display: block;
    }
  `]
})
export class InputTextareaComponent implements OnInit {
  @ViewChild('inputElement') inputElement!: ElementRef;

  @Output() BlurValue = new EventEmitter<string>();

  @Input() input_control = new FormControl<string | null>(null);
  @Input() input_placeholder = 'Ingrese el texto...';
  @Input() help_text: string | null = null;
  @Input() setFocus = false;
  @Input() input_rows = 3;
  @Input() input_maxlength = 0;
  @Input() input_minlength = 0;
  @Input() show_error_messages = true;
  @Input() show_character_count = true;
  @Input() patternValidMessage = 'Ingrese un valor válido';
  @Input() customClass = '';

  @Input() input_autosize: boolean | { minRows: number; maxRows: number } = false;

  /**
   * Getter inteligente que combina input_rows con el auto-crecimiento.
   * - Si input_autosize es true, usa input_rows como minRows y limita en 12 filas.
   * - Si es objeto, usa minRows/maxRows directamente.
   */
  get finalAutosize(): boolean | { minRows: number; maxRows: number } {
    if (this.input_autosize === true) {
      return { minRows: this.input_rows, maxRows: 12 };
    }
    return this.input_autosize;
  }

  onInputBlur(event: Event) {
    this.BlurValue.emit((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.onSetFocus();
  }

  private onSetFocus(): void {
    if (this.setFocus) {
      setTimeout(() => {
        if (this.inputElement) {
          this.inputElement.nativeElement.focus();
        }
      }, 150);
    }
  }
}
