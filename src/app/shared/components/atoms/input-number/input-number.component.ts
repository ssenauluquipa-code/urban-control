import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaskitoOptions } from '@maskito/core';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { InputErrorMessagesComponent } from '../input-error-messages/input-error-messages.component';
import { MaskitoDirective } from '@maskito/angular';
import { NgStyle, NgClass, NgIf } from '@angular/common';
import { NzInputGroupComponent, NzInputGroupWhitSuffixOrPrefixDirective, NzInputDirective } from 'ng-zorro-antd/input';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';

@Component({
    selector: 'app-input-number',
    template: `<nz-input-group
                [nzSize]="input_size"
                [nzSuffix]="suffixTemplateInfo"
                [nzPrefix]="prefixTemplateUser"
                [nzStatus]="input_control.invalid && input_control.touched?'error':''">
                <!-- input -->
                  <input
                    #inputElement
                    nz-input
                    type="text"
                    [placeholder]="input_placeholder"
                    [maxlength]="input_maxlength? input_maxlength + 1 : null"
                    [formControl]="input_control"
                    (blur)="onInputBlur($event)"
                    [ngStyle]="customStyles"
                    [ngClass]="customClass"
                    [maskito]="maskitoOptions"
                    [autofocus]="setFocus"
                    />

                </nz-input-group>
                <!-- Messages -->
                <small *ngIf="help_text && input_control.valid" class="text-muted">
                  <span nz-icon nzType="check-circle" nzTheme="fill" nzTheme="twotone" nzTwotoneColor="#52c41a"></span>
                  {{help_text}}
                </small>
                <!-- Error Messages -->
                 @if (show_error_messages) {
                   <app-input-error-messages
                     [input_control]="input_control"
                     [minValue]="input_minvalue"
                     [maxValue]="input_maxvalue"
                     [minLength]="input_minlength"
                     [maxLength]="input_maxlength"
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
                </ng-template>
            `,
    styles: `
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
      MaskitoDirective,
      NzIconDirective,
      InputErrorMessagesComponent
    ]
})
export class InputNumberComponent implements OnInit {
  @ViewChild('inputElement') inputElement!: ElementRef;

  @Output() onBlurValue = new EventEmitter<string | number>();
  @Input() input_control = new FormControl<string | number | null>(null);
  @Input() input_size: 'large' | 'default' | 'small' = 'default';
  @Input() input_placeholder: string = 'Ingrese un número';
  @Input() help_text: string | null = null;
  @Input() prefix_icon: string = '';
  @Input() suffix_icon: string = '';
  @Input() setFocus: boolean = false;
  @Input() input_maxlength: number = 0;
  @Input() input_minlength: number = 0;
  @Input() input_maxvalue: number = 0;
  @Input() input_minvalue: number = 0;
  @Input() show_error_messages: boolean = true;
  @Input() patternValidMessage: string = 'Ingrese un número válido';
  @Input() customStyles: { [key: string]: string } = {};
  @Input() customClass: string = '';
  @Input() allow_decimals: boolean = false; // Permitir decimales
  @Input() decimal_separator: string = '.'; // Separador decimal (. o ,)

  public passwordVisible: boolean = false;

  // Configuración para solo números enteros o decimales
  public maskitoOptions: MaskitoOptions = { mask: /^\d+$/ };

  ngOnInit(): void {
    this.onSetFocus();
    this.configureMask();
  }

  //metodo para el input
  public onInputBlur(event: any): void {
    this.onBlurValue.emit(event.target.value);
  }

  /** Configura la máscara según si permite decimales o no */
  private configureMask(): void {
    if (this.allow_decimals) {
      // Permite números con decimales (ej: 123.45 o 123,45)
      const separator = this.decimal_separator === ',' ? ',' : '\\.';
      this.maskitoOptions = {
        mask: new RegExp(`^\\d+${separator}?\\d*$`)
      };
    } else {
      // Solo números enteros
      this.maskitoOptions = {
        mask: /^\d+$/
      };
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
