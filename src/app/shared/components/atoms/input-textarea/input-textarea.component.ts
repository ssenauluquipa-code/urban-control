import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputErrorMessagesComponent } from '../input-error-messages/input-error-messages.component';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NgStyle, NgClass, NgIf } from '@angular/common';
import { NzInputDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective } from 'ng-zorro-antd/input';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

@Component({
  selector: 'app-input-textarea',
  template: `<div class="textarea-wrapper">
                <!-- nz-input-group para igualar el estilo visual con los demás inputs -->
                <nz-input-group
                  [nzSize]="input_size"
                  [nzStatus]="input_control.invalid && input_control.touched ? 'error' : ''">
                  <textarea
                    #inputElement
                    nz-input
                    [placeholder]="input_placeholder"
                    [rows]="input_rows"
                    [maxlength]="input_maxlength > 0 ? input_maxlength : null"
                    [formControl]="input_control"
                    (blur)="onInputBlur($event)"
                    
                    [ngClass]="customClass"
                    [class.error-border]="input_control.invalid && input_control.touched"
                    ></textarea>
                </nz-input-group>

                <!-- Contador debajo del textarea (no encima) para no bloquear el resize -->
                @if (show_character_count && input_maxlength > 0) {
                  <div class="character-count">
                    {{ input_control.value?.length || 0 }} / {{ input_maxlength }}
                  </div>
                }

                <!-- Messages -->
                @if(help_text && input_control.valid){
                  <small class="text-muted">
                  <span nz-icon nzType="check-circle" nzTheme="fill" nzTheme="twotone" nzTwotoneColor="#52c41a"></span>
                  {{help_text}}
                </small>
                }                 
                
                <!-- Error Messages -->
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
  styles: `
      :host {
        display: block;
        width: 100%;
      }
      .textarea-wrapper {
        width: 100%;
      }

      /* El textarea hereda el ancho del nz-input-group */
      textarea {
        width: 100%;
        resize: vertical;  /* El usuario puede agrandar verticalmente */
        min-height: 60px;
      }

      textarea.error-border {
        border-color: #ff4d4f;
      }

      textarea.error-border:focus {
        border-color: #ff4d4f;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }

      /* Contador ahora va debajo del textarea, NO encima */
      .character-count {
        display: flex;
        justify-content: flex-end;
        margin-top: 4px;
        font-size: 11px;
        color: rgba(0, 0, 0, 0.45);
      }

      .text-muted {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #52c41a;
      }
    `,
  standalone: true,
  imports: [
    ɵNzTransitionPatchDirective,
    NzInputGroupComponent,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzInputDirective,
    FormsModule,
    ReactiveFormsModule,
    NgStyle,
    NgClass,
    NgIf,
    NzIconDirective,
    InputErrorMessagesComponent
  ]
})
export class InputTextareaComponent implements OnInit {
  @ViewChild('inputElement') inputElement!: ElementRef;

  @Output() BlurValue = new EventEmitter<string>();
  @Input() input_control = new FormControl<string | null>(null);
  @Input() input_size: 'large' | 'default' | 'small' = 'default';
  @Input() input_placeholder = 'Ingrese el texto...';
  @Input() help_text: string | null = null;
  @Input() setFocus = false;
  @Input() input_rows = 4;
  @Input() input_maxlength = 0;
  @Input() input_minlength = 0;
  @Input() show_error_messages = true;
  @Input() show_character_count = true;
  @Input() patternValidMessage = 'Ingrese un valor válido';
  @Input() customClass = '';

  //metodo para el input
  onInputBlur(event: Event) {
    this.BlurValue.emit((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.onSetFocus();
  }

  /** Activa el focus del input al iniciar el componente siempre y cuando la 
   * propiedad setFocus sea verdadera => [setFocus]="true" */
  private onSetFocus(): void {
    setTimeout(() => {
      if (this.setFocus && this.inputElement) {
        this.inputElement.nativeElement.focus();
      }
    }, 100);
  }
}
