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
    <div class="input-search-wrapper">
      <nz-input-group nzSearch [nzAddOnAfter]="suffixButton">
        <input 
          type="text" 
          nz-input 
          [value]="displayText" 
          readonly 
          [placeholder]="placeholder" 
          (click)="openSearchModal()"
          style="cursor: pointer;"
        />
      </nz-input-group>
      <ng-template #suffixButton>
        <button 
          nz-button 
          nzType="primary" 
          nzSearch 
          (click)="openSearchModal()"
          [disabled]="disabled"
        >
          <span nz-icon nzType="search"></span>
          Buscar
        </button>
      </ng-template>

      @if (input_control.value) {
        <button 
          class="btn-clear" 
          (click)="clearSelection()" 
          title="Limpiar selección"
        >
          <span nz-icon nzType="close-circle" nzTheme="fill"></span>
        </button>
      }
    </div>
  `,
  styles: [`
    .input-search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .btn-clear {
      position: absolute;
      right: 110px; /* Ajustar según el ancho del botón buscar */
      z-index: 5;
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
  `]
})
export class InputSearchReservaComponent {
  @Input() input_control = new FormControl<string | null>(null);
  @Input() placeholder = 'Buscar reserva...';
  @Input() disabled = false;
  
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
    this.selectedReservaLabel = `#${reserva.codigoReserva} - ${reserva.nombreCliente}`;
    this.input_control.setValue(reserva.reservaId || reserva.id || null);
    this.OnReservaSelected.emit(reserva);
  }

  clearSelection(): void {
    this.selectedReservaLabel = '';
    this.input_control.setValue(null);
    this.OnClear.emit();
  }
}
