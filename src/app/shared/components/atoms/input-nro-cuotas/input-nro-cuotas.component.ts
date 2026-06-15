import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NzIconDirective } from 'ng-zorro-antd/icon';
import { InputNumberComponent } from '../input-number/input-number.component';
import { OrganizationFinancialConfigService } from 'src/app/core/services/configuracion/organization-financial-config.service';

/**
 * Input especializado para "Número de Cuotas".
 *
 * - Reutiliza app-input-number (mismo look & feel, mismas validaciones de error).
 * - Consulta el plazo máximo de cuotas configurado para la empresa
 *   (OrganizationFinancialConfigService -> plazoMaximoMeses).
 * - Aplica Validators.max(plazoMaximo) y Validators.min(1) AL CONTROL automáticamente,
 *   de modo que si el usuario ingresa más cuotas de las permitidas, el form queda
 *   inválido ANTES de llamar al servicio de registrar venta.
 * - Muestra al usuario el límite permitido como ayuda visual, y ese aviso se
 *   oculta automáticamente luego de 6 segundos.
 *
 * Uso (idéntico a como usabas app-input-number):
 * <app-form-field label="Nro. Cuotas" [required]="true">
 *   <app-input-nro-cuotas [input_control]="nroCuotas"></app-input-nro-cuotas>
 * </app-form-field>
 */
@Component({
  selector: 'app-input-nro-cuotas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzIconDirective, InputNumberComponent],
  template: `
    <app-input-number
      [input_control]="input_control"
      [input_size]="input_size"
      [input_placeholder]="input_placeholder"
      [input_maxvalue]="maxCuotas"
      [input_minvalue]="1"
      [setFocus]="setFocus"
      [show_error_messages]="show_error_messages"
      [patternValidMessage]="'Ingrese un número de cuotas válido'"
      (BlurValue)="onBlur($event)"
    ></app-input-number>

    <!-- Aviso del plazo máximo permitido -->
    @if (loadingPlazo) {
      <small class="text-muted">
        <span nz-icon nzType="loading" nzTheme="outline" class="me-1"></span>
        Consultando plazo máximo...
      </small>
    } @else if (maxCuotas > 0 && input_control.valid && showMaxInfo) {
      <small class="text-info">
        <span nz-icon nzType="info-circle" nzTheme="outline" class="me-1"></span>
        Plazo máximo permitido: {{ maxCuotas }} cuota{{ maxCuotas === 1 ? '' : 's' }}
      </small>
    }
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .text-muted,
    .text-info {
      display: block;
      margin-top: 4px;
      font-size: 12px;
    }

    .text-muted {
      color: #94a3b8;
    }

    .text-info {
      color: #1e3467;
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
})
export class InputNroCuotasComponent implements OnInit, OnDestroy {
  @Output() BlurValue = new EventEmitter<string | number>();
  @Input() input_control = new FormControl<string | number | null>(null);
  @Input() input_size: 'large' | 'default' | 'small' = 'default';
  @Input() input_placeholder = 'Ej: 12';
  @Input() setFocus = false;
  @Input() show_error_messages = true;

  /** Cuántos segundos se muestra el aviso de "Plazo máximo permitido" antes de ocultarse */
  @Input() infoMessageDuration = 6000; // ms

  /** Plazo máximo de cuotas según configuración de la empresa (0 = sin restricción) */
  public maxCuotas = 0;
  public loadingPlazo = true;
  public showMaxInfo = true;

  private financialConfig = inject(OrganizationFinancialConfigService);
  private destroy$ = new Subject<void>();
  private infoTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.financialConfig
      .getFinancialConfig()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.maxCuotas = config.plazoMaximoMeses ?? 0;
          this.loadingPlazo = false;

          if (this.maxCuotas > 0) {
            this.input_control.addValidators([
              Validators.min(1),
              Validators.max(this.maxCuotas),
            ]);
            this.input_control.updateValueAndValidity();

            // Mostrar el aviso inicial (si el valor actual es válido) y programar su ocultamiento
            this.scheduleHideInfo();

            // Cada vez que el usuario corrige el valor y vuelve a ser válido,
            // re-mostramos el aviso brevemente.
            this.input_control.valueChanges
              .pipe(takeUntil(this.destroy$))
              .subscribe(() => {
                if (this.input_control.valid) {
                  this.scheduleHideInfo();
                }
              });
          }
        },
        error: () => {
          // Si falla la consulta, no bloqueamos al usuario: simplemente no se aplica límite extra
          this.loadingPlazo = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.infoTimer) {
      clearTimeout(this.infoTimer);
    }
  }

  onBlur(value: string | number): void {
    this.BlurValue.emit(value);
  }

  /** Muestra el aviso de plazo máximo y lo oculta automáticamente tras infoMessageDuration ms */
  private scheduleHideInfo(): void {
    this.showMaxInfo = true;

    if (this.infoTimer) {
      clearTimeout(this.infoTimer);
    }

    this.infoTimer = setTimeout(() => {
      this.showMaxInfo = false;
    }, this.infoMessageDuration);
  }
}