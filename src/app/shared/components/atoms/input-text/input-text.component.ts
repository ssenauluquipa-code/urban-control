import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaskitoOptions } from '@maskito/core';
import { InputErrorMessagesComponent } from '../input-error-messages/input-error-messages.component';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { MaskitoDirective } from '@maskito/angular';
import { NgStyle, NgClass } from '@angular/common';
import { NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective, NzInputDirective } from 'ng-zorro-antd/input';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

@Component({
    selector: 'app-input-text',
    template: `<nz-input-group
                [nzSize]="input_size"
                [nzSuffix]="suffixTemplateInfo"
                [nzPrefix]="prefixTemplateUser"
                [nzStatus]="input_control.invalid && input_control.touched?'error':''">
                <!-- input -->
                  <input
                    #inputElement
                    [id]="inputId"
                    nz-input
                    [type]="passwordVisible? 'text' : input_type"
                    [placeholder]="input_placeholder"
                    [maxlength]="input_maxlength? input_maxlength + 1 : null"
                    [formControl]="input_control"
                    (blur)="onInputBlur($event)"
                    [ngStyle]="customStyles"
                    [ngClass]="customClass"
                    [maskito]="maskitoOptions"
                    />
                    <!-- (blur): Esto es un event binding y llamamos a un metodo onInputBlur esta abajo realizado -->
                    

                </nz-input-group>
                <!-- Messages -->
                 @if(help_text && input_control.valid){
                  <small  class="text-muted">
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
                <!-- Templates -->
                <ng-template #prefixTemplateUser>
                  @if (prefix_icon) {
                    <span nz-icon [nzType]="prefix_icon" nzTheme="outline" class="me-1"></span>
                  }
                </ng-template>
                <ng-template #suffixTemplateInfo>
                  @if (suffix_icon) { 
                    <span nz-icon [nzType]="suffix_icon" nzTheme="outline" ></span>
                  }
                  @if (enableCheckPass) {
                    <span 
                      role="button"
                      tabindex="0" 
                      nz-icon 
                      [nzType]="passwordVisible ? 'eye-invisible' : 'eye'" 
                      (click)="passwordVisible = !passwordVisible"
                      (keydown.enter)="passwordVisible = !passwordVisible"
                      (keydown.space)="passwordVisible = !passwordVisible; $event.preventDefault()">
                    </span>
                  }
                </ng-template>
            <!-- <pre>value:{{input_control.value}}</pre> -->
            `,
    styles: `
      :host {
        display: block;
        width: 100%;
      }
      .text-muted {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #52c41a;
      }
    `,
    standalone: true,
    imports: [ɵNzTransitionPatchDirective, NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective, NzInputDirective, FormsModule, ReactiveFormsModule, NgStyle, NgClass, MaskitoDirective, NzIconDirective, InputErrorMessagesComponent]
})
export class InputTextComponent implements OnInit {
  //  @Output():Permite que un componente hijo envíe datos o eventos a un componente padre.
  // @Output() junto con EventEmitter para emitir eventos que el componente padre puede escuchar.

  @ViewChild('inputElement') inputElement!: ElementRef;

  @Output() BlurValue = new EventEmitter<string>();
  @Input() input_control = new FormControl<string | number | null>(null);
  @Input() input_size: 'large' | 'default' | 'small' = 'default';
  @Input() input_type: 'text' | 'password' | 'email' = 'text';
  @Input() inputId = 'input-' + Math.random().toString(36).substring(2, 9);
  @Input() input_placeholder = '';
  @Input() help_text = '';
  @Input() prefix_icon = '';
  @Input() suffix_icon = '';
  @Input() setFocus = false;
  @Input() input_maxlength = 0;
  @Input() input_minlength = 0;
  @Input() enableCheckPass = false;
  @Input() show_error_messages = true;
  @Input() patternValidMessage = 'Ingrese un valor válido';
  @Input() customStyles: Record<string, string> = {}; //para poner estilos en caso de que se use disabled 
  @Input() customClass = '';
  @Input() input_maskito: RegExp | string = ''; // Patrón de máscara configurable
  public passwordVisible = false;

  public maskitoOptions: MaskitoOptions = { mask: /.*/ };

  //metodo para el input
  public onInputBlur(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.BlurValue.emit(target.value);
  }

  // Ejemplos de máscaras:
  // "^[a-zA-Z\\s]+$" - solo letras y espacios
  // "^[0-9]+$" - solo números
  // "^[a-zA-Z\\s]+$" - mantener siempre los corchetes[]
  ngOnInit(): void {
    this.onSetFocus();
     // Convertir el string a un objeto RegExp y configurar MaskitoOptions
     if (this.input_maskito) {
      try {
        const regex = typeof this.input_maskito === 'string' 
          ? new RegExp(this.input_maskito) 
          : this.input_maskito;
        this.maskitoOptions = {
          mask: regex
        };
      } catch (error) {
        console.error('Error al convertir la expresión regular:', error);
      }
    }
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
