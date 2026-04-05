import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CurrencyType = 'BS' | 'USD';
export type CurrencySize = 'small' | 'default' | 'large';

@Component({
  selector: 'app-currency-label',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './currency-label.component.html',
  styleUrls: ['./currency-label.component.scss']
})
export class CurrencyLabelComponent implements OnChanges, OnInit {
  @Input() value: number = 0;
  @Input() currency: CurrencyType = 'BS';
  @Input() size: CurrencySize = 'default';
  @Input() prefix: string = '';
  @Input() decimals: number = 2;

  formattedValue: string = '';

  ngOnInit(): void {
    this.formatValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] || changes['currency'] || changes['decimals']) {
      this.formatValue();
    }
  }

  private formatValue(): void {
    const formatted = new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals
    }).format(this.value);

    this.formattedValue = this.currency === 'USD' ? formatted : formatted;
  }
}
