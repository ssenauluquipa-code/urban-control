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
      <nz-radio-group
        [formControl]="input_control"
        nzButtonStyle="solid"
        nzSize="default"
        class="w-100 metodo-grid"
      >
        <label
          nz-radio-button
          [nzValue]="METODOS.EFECTIVO"
          class="metodo-item d-flex align-items-center justify-content-center"
        >
          <i class="bi bi-cash me-2 fs-5"></i>
          <span>EFECTIVO</span>
        </label>

        <label
          nz-radio-button
          [nzValue]="METODOS.TRANSFERENCIA"
          class="metodo-item d-flex align-items-center justify-content-center"
        >
          <i class="bi bi-bank me-2 fs-5"></i>
          <span>TRANSFERENCIA</span>
        </label>

        <label
          nz-radio-button
          [nzValue]="METODOS.QR"
          class="metodo-item d-flex align-items-center justify-content-center"
        >
          <i class="bi bi-qr-code me-2 fs-5"></i>
          <span>CÓDIGO QR</span>
        </label>

        <label
          nz-radio-button
          [nzValue]="METODOS.CHEQUE"
          class="metodo-item d-flex align-items-center justify-content-center"
        >
          <i class="bi bi-postcard me-2 fs-5"></i>
          <span>CHEQUE</span>
        </label>
      </nz-radio-group>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .metodo-pago-container {
      width: 100%;
      contain: content;
    }

    ::ng-deep .metodo-pago-container .metodo-grid {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
      width: 100%;
    }

    ::ng-deep .metodo-pago-container .metodo-item {
      text-align: center;
      display: flex !important;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      letter-spacing: 0.3px;
      transition: all 0.2s ease-in-out;
      height: 40px !important;
      line-height: 40px !important;
      padding: 0 !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;
      color: #475569;
      background: #ffffff;
      will-change: background, border-color;
    }

    ::ng-deep .metodo-pago-container .metodo-item::before {
      display: none !important;
    }

    ::ng-deep .metodo-pago-container .metodo-item:hover {
      color: #1e3467 !important;
      border-color: #1e3467 !important;
      background: #f8fafc;
    }

    ::ng-deep .metodo-pago-container .metodo-item:focus,
    ::ng-deep .metodo-pago-container .metodo-item-focused,
    ::ng-deep .metodo-pago-container .metodo-item:active {
      box-shadow: none !important;
    }

    ::ng-deep .metodo-pago-container .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
      background: #12223b !important;
      border-color: #12223b !important;
      color: #ffffff !important;
      box-shadow: none !important;
    }

    ::ng-deep .metodo-pago-container .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
      background: #12223b !important;
      border-color: #12223b !important;
      color: #ffffff !important;
    }

    i {
      vertical-align: middle;
      font-size: 1.1rem;
    }
  `,
})
export class MetodoPagoSelectorComponent implements OnInit, OnDestroy{
  @Input() input_control: FormControl<EMetodoPago | null> =
    new FormControl<EMetodoPago | null>(EMetodoPago.EFECTIVO);

  public readonly METODOS = EMetodoPago;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Escuchamos los cambios de valor internos para refrescar exclusivamente este componente de forma ultrarápida
    this.input_control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
