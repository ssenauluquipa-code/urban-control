import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputErrorMessagesComponent } from '../input-error-messages/input-error-messages.component';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { NgStyle, NgClass, NgIf } from '@angular/common';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

@Component({
    selector: 'app-input-textarea',
    template: `<div class="textarea-container">
                <!-- textarea -->
                  <textarea
                    #inputElement
                    nz-input
                    [placeholder]="input_placeholder"
                    [rows]="input_rows"
                    [maxlength]="input_maxlength > 0 ? input_maxlength : null"
                    [formControl]="input_control"
                    (blur)="onInputBlur($event)"
                    [ngStyle]="customStyles"
                    [ngClass]="customClass"
                    [class.error-border]="input_control.invalid && input_control.touched"
                    ></textarea>

                <!-- Character counter -->
                @if (show_character_count && input_maxlength > 0) {
                  <div class="character-count">
                    {{ input_control.value?.length || 0 }} / {{ input_maxlength }}
                  </div>
                }

                <!-- Messages -->
                <small *ngIf="help_text && input_control.valid" class="text-muted">
                  <span nz-icon nzType="check-circle" nzTheme="fill" nzTheme="twotone" nzTwotoneColor="#52c41a"></span>
                  {{help_text}}
                </small>
                
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
      .textarea-container {
        position: relative;
        width: 100%;
      }

      textarea {
        width: 100%;
        resize: vertical;
        min-height: 60px;
      }

      textarea.error-border {
        border-color: #ff4d4f;
      }

      textarea.error-border:focus {
        border-color: #ff4d4f;
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }

      .character-count {
        position: absolute;
        bottom: 8px;
        right: 11px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        pointer-events: none;
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

  @Output() onBlurValue = new EventEmitter<string>();
  @Input() input_control = new FormControl<string | null>(null);
  @Input() input_placeholder: string = 'Ingrese el texto...';
  @Input() help_text: string | null = null;
  @Input() setFocus: boolean = false;
  @Input() input_rows: number = 4;
  @Input() input_maxlength: number = 0;
  @Input() input_minlength: number = 0;
  @Input() show_error_messages: boolean = true;
  @Input() show_character_count: boolean = true;
  @Input() patternValidMessage: string = 'Ingrese un valor válido';
  @Input() customStyles: { [key: string]: string } = {};
  @Input() customClass: string = '';

  //metodo para el input
  onInputBlur(event: any) {
    this.onBlurValue.emit(event.target.value);
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
