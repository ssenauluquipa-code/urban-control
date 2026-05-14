import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ModalSearchReservaComponent } from './modal-search-reserva.component';
import { IReserva } from 'src/app/core/models/reserva.model';

@Component({
  selector: 'app-input-search-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzInputModule, NzButtonModule, NzIconModule],
  template: `
    <div class="input-search-wrapper" [class.disabled]="disabled">
      <div 
        class="custom-search-container" 
        [class.has-value]="!!input_control.value"
        role="button"
        tabindex="0"
        (click)="openSearchModal()"
        (keydown.enter)="openSearchModal()"
        (keydown.space)="openSearchModal()"
      >
        <div class="input-area">
          <input 
            type="text" 
            [value]="displayText" 
            readonly 
            [placeholder]="placeholder" 
            [disabled]="disabled"
          />
          @if (input_control.value) {
            <button 
              class="btn-clear" 
              (click)="clearSelection($event)" 
              title="Limpiar selección"
            >
              <span nz-icon nzType="close-circle" nzTheme="fill"></span>
            </button>
          }
        </div>
        <button 
          class="btn-search" 
          type="button"
          [disabled]="disabled"
        >
          <span nz-icon nzType="search"></span>
          <span>Buscar</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .input-search-wrapper {
      width: 100%;
    }
    
    .custom-search-container {
      display: flex;
      align-items: stretch;
      width: 100%;
      height: 42px;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      overflow: hidden;
      background-color: #fff;
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover:not(.disabled) {
        border-color: #12223b;
        box-shadow: 0 0 0 2px rgba(83, 74, 183, 0.1);
      }

      &.has-value {
        border-color: #12223b;
        background-color: #f8f9ff;
      }
    }

    .disabled .custom-search-container {
      background-color: #f5f5f5;
      cursor: not-allowed;
      border-color: #d9d9d9;
    }

    .input-area {
      flex: 1;
      display: flex;
      align-items: center;
      position: relative;
      padding: 0 12px;
      min-width: 0;

      input {
        width: 100%;
        border: none;
        background: transparent;
        outline: none;
        color: #333;
        font-size: 14px;
        cursor: pointer;
        padding-right: 24px; /* Space for clear button */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &::placeholder {
          color: #bfbfbf;
        }

        &:disabled {
          color: #rgba(0, 0, 0, 0.25);
          cursor: not-allowed;
        }
      }
    }

    .btn-clear {
      position: absolute;
      right: 8px;
      border: none;
      background: transparent;
      color: #bfbfbf;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.3s;
      
      &:hover {
        color: #8c8c8c;
      }
    }

    .btn-search {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 16px;
      border: none;
      background-color: #12223b;
      color: #fff;
      font-weight: 500;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background-color: #12223b;
      }

      &:disabled {
        background-color: #d9d9d9;
        color: #rgba(0, 0, 0, 0.25);
        cursor: not-allowed;
      }

      span[nz-icon] {
        font-size: 16px;
      }
    }
  `]
})
export class InputSearchReservaComponent {
  @Input() input_control = new FormControl<string | null>(null);
  @Input() placeholder = 'Buscar reserva...';
  @Input() disabled = false;

  @Input() set selectedLabel(value: string) {
    this.selectedReservaLabel = value;
  }

  @Output() OnReservaSelected = new EventEmitter<IReserva>();
  @Output() OnClear = new EventEmitter<void>();

  private modalService = inject(NzModalService);

  public selectedReservaLabel = '';

  get displayText(): string {
    return this.selectedReservaLabel || '';
  }

  openSearchModal(): void {
    if (this.disabled) return;

    const modal = this.modalService.create({
      nzTitle: 'Buscar Reserva Activa',
      nzContent: ModalSearchReservaComponent,
      nzWidth: 800,
      nzFooter: null,
      nzCentered: true
    });

    modal.afterClose.subscribe((reserva: IReserva) => {
      if (reserva) {
        this.applySelection(reserva);
      }
    });
  }

  private applySelection(reserva: IReserva): void {
    const mza = reserva.manzana || reserva.lote?.manzana?.codigo || '';
    const lote = reserva.numeroLote || reserva.lote?.numero || '';

    this.selectedReservaLabel = `#${reserva.codigoReserva} - Mza. ${mza} Lote ${lote}`;
    this.input_control.setValue(reserva.reservaId || reserva.id || null);
    this.OnReservaSelected.emit(reserva);
  }

  clearSelection(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.selectedReservaLabel = '';
    this.input_control.setValue(null);
    this.OnClear.emit();
  }
}
