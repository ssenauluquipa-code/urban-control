import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';

export interface ICliente {
  id: number;
  nombre: string;
  ci: string;
  telefono?: string;
  email?: string;
  disabled?: boolean;
}

export type SelectSize = 'large' | 'default' | 'small';

@Component({
  selector: 'app-cliente-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule, NzIconModule],
  templateUrl: './cliente-selector.component.html',
  styleUrls: ['./cliente-selector.component.scss']
})
export class ClienteSelectorComponent implements OnInit, OnChanges {
  @Input() options: ICliente[] = [];
  @Input() valueField: keyof ICliente = 'id';
  @Input() labelField: keyof ICliente = 'nombre';
  @Input() placeholder: string = 'Seleccionar cliente';
  @Input() disabled: boolean = false;
  @Input() size: SelectSize = 'default';
  @Input() serverSearch: boolean = false;
  @Input() value: number | null = null;

  @Output() valueChange = new EventEmitter<number | null>();
  @Output() searchChange = new EventEmitter<string>();

  selectedValue: number | null = null;
  filteredOptions: ICliente[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.selectedValue = this.value;
    this.filteredOptions = [...this.options];
  }

  ngOnChanges(): void {
    this.filteredOptions = [...this.options];
  }

  onValueChange(value: number | null): void {
    this.selectedValue = value;
    this.valueChange.emit(value);
  }

  onSearch(value: string): void {
    this.searchChange.emit(value);

    if (!this.serverSearch && value) {
      this.filteredOptions = this.options.filter(option => {
        const label = option[this.labelField]?.toString().toLowerCase() || '';
        const ci = option.ci?.toLowerCase() || '';
        const searchValue = value.toLowerCase();
        return label.includes(searchValue) || ci.includes(searchValue);
      });
    } else if (!value) {
      this.filteredOptions = [...this.options];
    }
  }

  getOptionLabel(option: ICliente): string | null {
    const value = option[this.labelField];
    if (value === undefined || value === null) {
      return null;
    }
    return String(value);
  }

  loadMore(): void {
    // Implementar paginación si es necesario
  }
}
