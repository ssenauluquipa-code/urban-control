import {
  ChangeDetectorRef,
  Component,
  DoCheck,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  NzInputDirective,
  NzInputGroupComponent,
  NzInputGroupWhitSuffixOrPrefixDirective,
} from 'ng-zorro-antd/input';
import { ɵNzTransitionPatchDirective } from 'ng-zorro-antd/core/transition-patch';
import { Subject, takeUntil } from 'rxjs';

export type InputCurrencySize = 'small' | 'default' | 'large';

/**
 * Input editable con formato de moneda (miles y decimales, locale es-BO).
 * Misma apariencia que app-input-number; el FormControl guarda un número.
 */
@Component({
  selector: 'app-input-currency',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ɵNzTransitionPatchDirective,
    NzInputGroupComponent,
    NzInputGroupWhitSuffixOrPrefixDirective,
    NzInputDirective,
  ],
  template: `
    <nz-input-group
      [nzSize]="nzSize"
      [nzPrefix]="currencyPrefix"
      [nzStatus]="
        input_control.invalid && input_control.touched ? 'error' : ''
      "
    >
      <input
        nz-input
        type="text"
        inputmode="decimal"
        [placeholder]="placeholder"
        [disabled]="input_control.disabled"
        [value]="displayValue"
        (input)="onDisplayInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />
    </nz-input-group>
    <ng-template #currencyPrefix>
      <span class="currency-prefix">{{ currency }}</span>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .currency-prefix {
      color: rgba(0, 0, 0, 0.45);
      font-size: 14px;
      font-weight: 400;
    }
  `,
})
export class InputCurrencyComponent
  implements OnInit, OnDestroy, DoCheck, OnChanges
{
  @Input() input_control = new FormControl<number | null>(null);
  @Input() currency = 'BS';
  @Input() placeholder = '0,00';
  @Input() decimals = 2;
  @Input() size: InputCurrencySize = 'default';

  displayValue = '';
  private editing = false;
  private lastSyncedValue: number | null = null;
  private readonly destroy$ = new Subject<void>();
  private readonly cdr = inject(ChangeDetectorRef);

  get nzSize(): 'large' | 'default' | 'small' {
    if (this.size === 'small') return 'small';
    if (this.size === 'large') return 'large';
    return 'default';
  }

  ngOnInit(): void {
    this.syncDisplayFromControl();
    this.input_control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.editing) {
          this.syncDisplayFromControl();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currency'] && !this.editing) {
      this.syncDisplayFromControl();
    }
  }

  /**
   * Sincroniza cuando el padre hace patchValue con emitEvent: false
   * (lote, reserva, cambio de moneda).
   */
  ngDoCheck(): void {
    if (this.editing) return;

    const current = Number(this.input_control.value ?? 0);
    if (this.lastSyncedValue !== current) {
      this.syncDisplayFromControl();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Marca edición; el texto sigue con formato es-BO (ej. 15.000,00). */
  onFocus(): void {
    this.editing = true;
    this.syncDisplayFromControl();
  }

  /** Parsea, guarda número en el control y reaplica formato. */
  onBlur(): void {
    this.editing = false;
    const parsed = this.parseDisplayValue(this.displayValue);
    this.input_control.setValue(parsed);
    this.input_control.markAsTouched();
    this.syncDisplayFromControl();
  }

  onDisplayInput(event: Event): void {
    this.displayValue = (event.target as HTMLInputElement).value;
  }

  /** Formato visual es-BO: miles con punto y decimales con coma. */
  private formatAmount(amount: number): string {
    return new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    }).format(amount ?? 0);
  }

  /**
   * Convierte texto con miles (.) y decimales (,) a número.
   */
  private parseDisplayValue(raw: string): number {
    const value = raw.trim();
    if (!value) return 0;

    if (value.includes(',')) {
      return Number(value.replace(/\./g, '').replace(',', '.')) || 0;
    }

    const normalized = value.replace(/\./g, '');
    return Number(normalized) || 0;
  }

  private syncDisplayFromControl(): void {
    const current = Number(this.input_control.value ?? 0);
    this.lastSyncedValue = current;
    this.displayValue = this.formatAmount(current);
    this.cdr.markForCheck();
  }
}
