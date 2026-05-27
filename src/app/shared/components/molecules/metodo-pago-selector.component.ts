import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { Subject, takeUntil } from 'rxjs';
import { EMetodoPago } from 'src/app/core/models/pagos.model';

@Component({
  selector: 'app-metodo-pago-selector',
  standalone: true,
  imports: [CommonModule, NzRadioModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metodo-pago-container">
      <div class="metodo-grid-wrapper">
        <nz-radio-group
          [formControl]="input_control"
          nzButtonStyle="solid"
          nzSize="default"
        >
          <label nz-radio-button [nzValue]="METODOS.EFECTIVO" class="metodo-item">
            <span class="metodo-inner">
              <i class="bi bi-cash"></i>
              <span class="metodo-label">Efectivo</span>
            </span>
          </label>

          <label nz-radio-button [nzValue]="METODOS.TRANSFERENCIA" class="metodo-item">
            <span class="metodo-inner">
              <i class="bi bi-bank"></i>
              <span class="metodo-label">Transferencia</span>
            </span>
          </label>

          <label nz-radio-button [nzValue]="METODOS.QR" class="metodo-item">
            <span class="metodo-inner">
              <i class="bi bi-qr-code"></i>
              <span class="metodo-label">Código QR</span>
            </span>
          </label>

          <label nz-radio-button [nzValue]="METODOS.CHEQUE" class="metodo-item">
            <span class="metodo-inner">
              <i class="bi bi-postcard"></i>
              <span class="metodo-label">Cheque</span>
            </span>
          </label>
        </nz-radio-group>
      </div>
    </div>
  `,
  styles: `
:host {
  display: block;
  width: 100%;
}

/* Grid */
::ng-deep .metodo-pago-container .metodo-grid-wrapper nz-radio-group {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: .5rem !important;
  width: 100% !important;
  flex-wrap: unset !important;
  flex-direction: unset !important;
}

/* Label — solo caja, sin flex propio */
::ng-deep .metodo-pago-container .metodo-item {
  display: block !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  min-height: 72px !important;
  border-radius: 10px !important;
  border: 1px solid #e2e8f0 !important;
  background: #fff;
  transition: all .2s ease;
  cursor: pointer;
}

::ng-deep .metodo-pago-container .metodo-item::before {
  display: none !important;
}

/* Nuestro span controla el layout — ng-zorro no lo toca */
::ng-deep .metodo-pago-container .metodo-inner {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  width: 100%;
  height: 100%;
  min-height: 72px;
  padding: 14px 8px;
  text-align: center;
}

::ng-deep .metodo-pago-container .metodo-inner i {
  font-size: 1.4rem;
  line-height: 1;
  flex-shrink: 0;
}

::ng-deep .metodo-pago-container .metodo-label {
  font-size: .72rem;
  font-weight: 600;
  color: #475569;
  line-height: 1.2;
}

/* HOVER */
::ng-deep .metodo-pago-container .metodo-item:hover {
  border-color: #1e3467 !important;
  background: #f8fafc;
  transform: translateY(-2px);
}

::ng-deep .metodo-pago-container .metodo-item:hover .metodo-label,
::ng-deep .metodo-pago-container .metodo-item:hover i {
  color: #1e3467 !important;
}

/* SELECCIONADO */
::ng-deep .metodo-pago-container
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  background: #12223b !important;
  border-color: #12223b !important;
  box-shadow: 0 4px 12px rgba(18, 34, 59, .2) !important;
}

::ng-deep .metodo-pago-container
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)
  .metodo-label,
::ng-deep .metodo-pago-container
  .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled)
  i {
  color: #fff !important;
}

/* ≥ 1400px — 4 columnas */
@media (min-width: 1400px) {
  ::ng-deep .metodo-pago-container .metodo-grid-wrapper nz-radio-group {
    grid-template-columns: repeat(4, 1fr) !important;
    gap: .5rem !important;
  }
}
  `
})
export class MetodoPagoSelectorComponent implements OnInit, OnDestroy {
  @Input() input_control: FormControl<EMetodoPago | null> =
    new FormControl<EMetodoPago | null>(EMetodoPago.EFECTIVO);

  public readonly METODOS = EMetodoPago;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.input_control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}