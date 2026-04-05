import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-input-text-info',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-1.5">

      <!-- Label -->
      @if (label) {
        <label 
          class="text-[11px] font-bold text-secondary uppercase tracking-wider"
          [class.required]="required">
          {{ label }}
        </label>
      }

      <!-- Field -->
      <div 
        class="w-full field-container rounded-lg px-4 py-3 transition-all group"
        [class.clickable]="clickable && !disabled"
        [class.disabled]="disabled"
        [class.error]="hasError"
        [attr.tabindex]="clickable && !disabled ? 0 : null"
        (click)="handleClick()">

        <!-- Value -->
        @if (!isEmpty) {
          <div class="flex items-center justify-between">
            <span 
              class="field-text"
              [class.text-error]="hasError"
              [class.font-medium]="bold">
              {{ displayValue }}
            </span>

            @if (showCopy) {
              <button 
                (click)="copyToClipboard($event)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-secondary hover:text-primary">
                <span class="material-symbols-outlined text-sm">content_copy</span>
              </button>
            }
          </div>
        }

        <!-- Empty -->
        @if (isEmpty) {
          <span class="field-placeholder">
            {{ emptyText }}
          </span>
        }

      </div>

      <!-- Helper -->
      @if (helperText) {
        <p 
          class="text-xs text-secondary leading-relaxed"
          [class.text-error]="hasError">
          {{ helperText }}
        </p>
      }

    </div>
  `,
  styles: [`
    /* Base */
    .field-container {
      background-color: #eff4ff; /* surface-container-low */
      font-size: 0.875rem;
      line-height: 1.25rem;
      outline: none;
      transition: all 0.2s ease;
      border-radius: 10px;
    }

    /* Text */
    .field-text {
      color: #0b1c30; /* on-surface */
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    /* Placeholder */
    .field-placeholder {
      color: #565e74; /* secondary */
      font-size: 0.875rem;
      font-style: italic;
    }

    /* Hover */
    .field-container.clickable:hover:not(.disabled) {
      background-color: #e5eeff; /* surface-container */
      cursor: pointer;
    }

    /* Focus */
    .field-container.clickable:focus {
      background-color: #f8f9ff; /* surface */
      box-shadow: 0 0 0 4px rgba(83, 74, 183, 0.15);
    }

    /* Disabled */
    .disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background-color: #f1f5f9;
    }

    /* Error */
    .error {
      background-color: #fffbfa;
      box-shadow: 0 0 0 4px rgba(186, 26, 26, 0.1);
    }

    /* Required */
    .required::after {
      content: '*';
      margin-left: 4px;
      color: #ba1a1a;
      font-weight: bold;
    }
  `]
})
export class InputTextInfoComponent {

  // Inputs
  @Input() label: string = '';
  @Input() value: any;
  @Input() emptyText: string = 'No especificado';
  @Input() helperText: string = '';
  @Input() required: boolean = false;
  @Input() hasError: boolean = false;
  @Input() bold: boolean = false;
  @Input() clickable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() showCopy: boolean = false;
  @Input() formatter?: (value: any) => string;

  // Outputs
  @Output() clicked = new EventEmitter<void>();
  @Output() copied = new EventEmitter<string>();

  // Getters
  get isEmpty(): boolean {
    return this.value === null || this.value === undefined || this.value === '';
  }

  get displayValue(): string {
    if (this.isEmpty) return '';

    if (this.formatter) return this.formatter(this.value);

    if (typeof this.value === 'object') return '[Objeto]';

    return String(this.value);
  }

  // Events
  handleClick(): void {
    if (this.clickable && !this.disabled) {
      this.clicked.emit();
    }
  }

  copyToClipboard(event: MouseEvent): void {
    event.stopPropagation();

    if (!this.displayValue) return;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.displayValue);
    } else {
      this.fallbackCopy(this.displayValue);
    }

    this.copied.emit(this.displayValue);
  }

  // Utils
  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}