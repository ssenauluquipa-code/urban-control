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
  display:block;
  width:100%;
}

.metodo-pago-container{
  width:100%;
}

/* GRID RESPONSIVE */
::ng-deep .metodo-pago-container .metodo-grid{
  display:grid !important;

  /* Se adapta automáticamente */
  grid-template-columns:repeat(
    auto-fit,
    minmax(160px,1fr)
  );

  gap:.75rem;
  width:100%;
}


/* TARJETA */
::ng-deep .metodo-pago-container .metodo-item{

  display:flex !important;
  align-items:center;
  justify-content:center;

  gap:.5rem;

  text-align:center;

  min-height:50px;

  padding:.75rem !important;

  border-radius:12px !important;

  border:1px solid #e2e8f0 !important;

  font-weight:600;

  color:#475569;

  background:#fff;

  transition:all .25s ease;

  white-space:normal; /* permite bajar línea */
  word-break:break-word;

}


::ng-deep .metodo-pago-container .metodo-item::before{
  display:none !important;
}


/* HOVER */
::ng-deep .metodo-pago-container .metodo-item:hover{

  color:#1e3467 !important;

  border-color:#1e3467 !important;

  background:#f8fafc;

  transform:translateY(-2px);
}


/* SELECCIONADO */

::ng-deep
.metodo-pago-container
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled){

  background:#12223b !important;

  border-color:#12223b !important;

  color:#fff !important;

}


/* ICONO */

i{
  font-size:1.2rem;
  flex-shrink:0;
}


/* TABLET */

@media(max-width:768px){

  .metodo-pago-container .metodo-grid{

    grid-template-columns:
      repeat(2,1fr);

  }

}


/* MÓVIL */

@media(max-width:576px){

  .metodo-pago-container .metodo-grid{

    grid-template-columns:1fr;

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
