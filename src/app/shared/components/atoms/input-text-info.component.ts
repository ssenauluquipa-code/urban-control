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
        <span 
          class="block text-[11px] font-bold text-secondary uppercase tracking-wider"
          [class.required]="required">
          {{ label }}
        </span>
      }

      <!-- Field -->
      <div 
        class="field-container ui-input-base transition-all group"
        [class.clickable]="clickable && !disabled"
        [class.disabled]="disabled"
        [class.error]="hasError"
        [attr.tabindex]="clickable && !disabled ? 0 : null"
        (click)="handleClick()"
        (keydown.enter)="handleClick()"
        (keydown.space)="handleClick()">

        <!-- Value -->
        @if (!isEmpty) {
          <div class="flex items-center justify-between w-full">
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
      outline: none;
      transition: all 0.2s ease;
      justify-content: space-between;
    }

    /* Text */
    .field-text {
      color: #0b1c30; /* on-surface */
    }

    /* Placeholder */
    .field-placeholder {
      color: #565e74; /* secondary */
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
  @Input() label = '';
  @Input() value: unknown;
  @Input() emptyText = 'No especificado';
  @Input() helperText = '';
  @Input() required = false;
  @Input() hasError = false;
  @Input() bold = false;
  @Input() clickable = false;
  @Input() disabled = false;
  @Input() showCopy = false;
  @Input() formatter?: (value: unknown) => string;

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