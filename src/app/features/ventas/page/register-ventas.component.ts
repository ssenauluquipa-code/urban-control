import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { FrecuenciaPago, TipoPago } from "src/app/core/models/venta.model";
import {
  cuotaInicialNoMayorAlMontoTotalValidator,
  diasPagoQuincenalValidator,
  propietariosVentaValidator,
} from "../validators/venta.validators";
import { VentaService } from "src/app/core/services/venta.service";
import { RegisterVentaViewComponent } from "../views/register-venta-view/register-venta-view.component";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { ActivatedRoute, Router } from "@angular/router";
import { ReservaService } from "src/app/core/services/reserva.service";
import { ViewChild } from "@angular/core";
import { NotificationService } from "src/app/core/services/notification.service";
import { LoteService } from "src/app/core/services/proyectos/lote.service";
import { OrganizationFinancialConfigService } from "src/app/core/services/configuracion/organization-financial-config.service";
import { CurrencyCalculationService } from "src/app/core/services/finance/currency-calculation.service";
import { Moneda } from "src/app/core/models/reserva.model";
import { merge, Subject } from "rxjs";
import { take } from "rxjs/operators";


/** Página contenedora: formulario reactivo y envío de nueva venta. */
@Component({
  selector: "app-register-ventas",
  standalone: true,
  imports: [RegisterVentaViewComponent, PageContainerComponent],
  template: `
    <app-page-container
      [title]="'Registro de Venta'"
      (Save)="handleSave()"
      [showSave]="true"
      [loading]="loading"
      [showCancel]="true"
      [showOptions]="false"
    >
      <app-register-venta-view
        #ventaView
        [form]="form"
        [loading]="loading"
        [monedaBase]="monedaBase"
      ></app-register-venta-view>
    </app-page-container>
  `,
  styles: ``,
})
export class RegisterVentasComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private notification = inject(NotificationService);
  private loteService = inject(LoteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaService = inject(ReservaService);
  private cdr = inject(ChangeDetectorRef);
  private financialConfig = inject(OrganizationFinancialConfigService);
  private currencyCalc = inject(CurrencyCalculationService);
  private destroy$ = new Subject<void>();
  private plazoMaximo = 600;

  /** Moneda base de la organización (precio de lote en catálogo). */
  monedaBase: Moneda = Moneda.USD;

  @ViewChild('ventaView') ventaView!: RegisterVentaViewComponent;

  loading = false;

  form: FormGroup = this.fb.group(
    {
      loteId: [null, [Validators.required]],
      reservaId: [null],
      tipoPago: [TipoPago.CONTADO, [Validators.required]],
      moneda: [Moneda.USD, [Validators.required]],
      tipoCambio: [null, [Validators.required, Validators.min(0.01)]],
      montoTotal: [0, [Validators.required, Validators.min(0.01)]],
      cuotaInicial: [0],
      frecuenciaPago: [null],
      modalidadCalendarioPago: [null],
      diaSemanaPago: [null],
      diaPagoMes1: [null],
      diaPagoMes2: [null],
      nroCuotas: [null, [Validators.max(600)]],
      fechaVenta: [new Date(), [Validators.required]],
      fechaPagoInicial: [null],
      observaciones: [""],
      propietarios: [
        [],
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(3),
          propietariosVentaValidator,
        ],
      ],
    },
    {
      validators: [
        cuotaInicialNoMayorAlMontoTotalValidator(),
        diasPagoQuincenalValidator(),
      ],
    },
  );

  ngOnInit(): void {
    this.loadOrganizationFinancialDefaults();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor() {
    this.listenFormChanges();
    this.updateFinancingValidators(this.form.get("tipoPago")?.value);
  }

  /**
   * Carga moneda base y tipo de cambio desde la configuración de la empresa.
   */
  private loadOrganizationFinancialDefaults(): void {
    this.financialConfig
      .getFinancialConfig()
      .pipe(take(1))
      .subscribe((config) => {
        const monedaBase = this.toMoneda(config.currency);
        this.monedaBase = monedaBase;
        this.plazoMaximo = config.plazoMaximoMeses ?? 600;
        this.form.patchValue({
          moneda: this.monedaBase,
          tipoCambio: config.exchangeRate,
        });
      });
  }

  /** Mapea código de moneda de configuración al enum Moneda. */
  private toMoneda(currency: string): Moneda {
    return currency === Moneda.USD ? Moneda.USD : Moneda.BS;
  }

  /** Calcula el número máximo de cuotas permitido según la frecuencia y el plazo máximo en meses. */
  private calcularMaxCuotas(plazoMaximoMeses: number, frecuencia: FrecuenciaPago | null): number {
    if (!plazoMaximoMeses || plazoMaximoMeses <= 0) return 600;
    if (!frecuencia) return plazoMaximoMeses;
    switch (frecuencia) {
      case FrecuenciaPago.SEMANAL:
        return Math.floor((plazoMaximoMeses / 12) * 52);
      case FrecuenciaPago.QUINCENAL:
        return plazoMaximoMeses * 2;
      case FrecuenciaPago.MENSUAL:
        return plazoMaximoMeses;
      case FrecuenciaPago.BIMESTRAL:
        return Math.floor(plazoMaximoMeses / 2);
      case FrecuenciaPago.TRIMESTRAL:
        return Math.floor(plazoMaximoMeses / 3);
      default:
        return plazoMaximoMeses;
    }
  }

  /**
   * Convierte el precio del lote (moneda base) al monto total en la moneda de la venta.
   */
  recalculateMontoTotal(precioLote: number): void {
    const monedaOperacion = this.form.get("moneda")?.value as Moneda;
    const tipoCambio = Number(this.form.get("tipoCambio")?.value || 0);
    const montoTotal = this.currencyCalc.convertirMonto(
      precioLote,
      this.monedaBase,
      monedaOperacion,
      tipoCambio,
    );    
    this.form.patchValue({ montoTotal }, { emitEvent: false });
    this.form.updateValueAndValidity({ emitEvent: false });
  }




  /** Reacciona a cambios de lote, moneda, tipo de pago y monto total. */
  private listenFormChanges() {
    this.form.get("loteId")?.valueChanges.subscribe((id) => {
      if (id) {
        this.loteService.getLoteById(id).subscribe((lote) => {          
          this.recalculateMontoTotal(lote.precioReferencial);
        });
      } else {
        this.form.patchValue({ montoTotal: 0 });
        this.form.updateValueAndValidity({ emitEvent: false });
      }
    });

    merge(
      this.form.get("moneda")!.valueChanges,
      this.form.get("tipoCambio")!.valueChanges,
    ).subscribe(() => {
      if (this.form.get("reservaId")?.value) return;
      const loteId = this.form.get("loteId")?.value;
      if (!loteId) return;
      this.loteService.getLoteById(loteId).subscribe((lote) => {
        this.recalculateMontoTotal(lote.precioReferencial);
      });
    });

    this.form.get("tipoPago")?.valueChanges.subscribe((tipo) => {
      this.updateFinancingValidators(tipo);
    });

    this.form.get("frecuenciaPago")?.valueChanges.subscribe(() => {
      this.updateFinancingValidators(this.form.get("tipoPago")?.value);
    });

    this.form.get("modalidadCalendarioPago")?.valueChanges.subscribe(() => {
      this.updateFinancingValidators(this.form.get("tipoPago")?.value);
    });

    this.form.get("montoTotal")?.valueChanges.subscribe(() => {
      this.form.updateValueAndValidity({ emitEvent: false });
    });
  }

  /** Activa o limpia validadores según CONTADO o CUOTAS. */
  private updateFinancingValidators(tipo: TipoPago | null) {
    const fieldsToClear = [
      "frecuenciaPago",
      "modalidadCalendarioPago",
      "diaSemanaPago",
      "diaPagoMes1",
      "diaPagoMes2",
      "nroCuotas",
      "fechaPagoInicial",
    ];

    this.form.get("cuotaInicial")?.clearValidators();

    if (tipo === TipoPago.CONTADO) {
      const hasReserva = !!this.form.get("reservaId")?.value;

      this.form.patchValue(
        {
          cuotaInicial: hasReserva ? this.form.get("cuotaInicial")?.value : 0,
          frecuenciaPago: null,
          modalidadCalendarioPago: null,
          diaSemanaPago: null,
          diaPagoMes1: null,
          diaPagoMes2: null,
          nroCuotas: null,
          fechaPagoInicial: null,
        },
        { emitEvent: false },
      );

      fieldsToClear.forEach((field) => {
        this.form.get(field)?.clearValidators();
      });
    } else {
      // CONFIGURACIÓN PARA VENTA A CUOTAS (FINANCIADA)
      this.form.get("cuotaInicial")?.setValidators([Validators.required, Validators.min(0.01)]);
      this.form.get("frecuenciaPago")?.setValidators([Validators.required]);
      
      const frecuencia = this.form.get("frecuenciaPago")?.value;
      const maxCuotasCalculado = this.calcularMaxCuotas(this.plazoMaximo, frecuencia);
      this.form.get("nroCuotas")?.setValidators([Validators.required, Validators.min(1), Validators.max(maxCuotasCalculado)]);
      this.form.get("fechaPagoInicial")?.setValidators([Validators.required]);

      const modalidad = this.form.get("modalidadCalendarioPago")?.value;

      // 1. Caso SEMANAL
      if (frecuencia === FrecuenciaPago.SEMANAL) {
        this.form.get("diaSemanaPago")?.setValidators([Validators.required]);
      } else {
        this.form.get("diaSemanaPago")?.clearValidators();
        this.form.get("diaSemanaPago")?.setValue(null, { emitEvent: false });
      }

      // 2. Caso QUINCENAL
      if (frecuencia === FrecuenciaPago.QUINCENAL) {
        this.form.get("modalidadCalendarioPago")?.setValidators([Validators.required]);

        if (modalidad === "DIAS_FIJOS_MES") {
          this.form.get("diaPagoMes1")?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
          this.form.get("diaPagoMes2")?.setValidators([Validators.required, Validators.min(1), Validators.max(31)]);
        } else {
          this.form.get("diaPagoMes1")?.clearValidators();
          this.form.get("diaPagoMes2")?.clearValidators();
          this.form.get("diaPagoMes1")?.setValue(null, { emitEvent: false });
          this.form.get("diaPagoMes2")?.setValue(null, { emitEvent: false });
        }
      } else {
        // Si no es quincenal, limpiamos modalidad y días fijos
        this.form.get("modalidadCalendarioPago")?.clearValidators();
        this.form.get("modalidadCalendarioPago")?.setValue(null, { emitEvent: false });
        this.form.get("diaPagoMes1")?.clearValidators();
        this.form.get("diaPagoMes2")?.clearValidators();
        this.form.get("diaPagoMes1")?.setValue(null, { emitEvent: false });
        this.form.get("diaPagoMes2")?.setValue(null, { emitEvent: false });
      }

      // 3. Caso MENSUAL / BIMESTRAL / TRIMESTRAL
      // Según Regla 3: diaSemanaPago, modalidadCalendarioPago, diaPagoMes1/2 deben ser NULL.
      // La lógica de arriba ya se encarga de limpiarlos si la frecuencia no es SEMANAL o QUINCENAL.
    }

    // Call updateValueAndValidity only ONCE for each affected field
    this.form.get("cuotaInicial")?.updateValueAndValidity({ emitEvent: false });
    fieldsToClear.forEach((field) =>
      this.form.get(field)?.updateValueAndValidity({ emitEvent: false }),
    );
    this.form.updateValueAndValidity({ emitEvent: false });
  }

  /** Valida el formulario y registra la venta en el backend. */
  handleSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.form.hasError("cuotaInicialExceedsTotal")) {
        this.notification.warning(
          "La cuota inicial no puede ser mayor al monto total.",
        );
        return;
      }

      if (this.form.hasError("duplicatedPaymentDays")) {
        this.notification.warning(
          "Los días de pago quincenal no pueden ser iguales.",
        );
        return;
      }

      const propietariosControl = this.form.get("propietarios");

      if (propietariosControl) {
        if (propietariosControl.hasError("duplicateOwners")) {
          this.notification.warning("No se puede registrar el mismo cliente más de una vez.");
          return;
        }
        if (propietariosControl.hasError("invalidTitularCount")) {
          this.notification.warning("La venta debe tener exactamente un propietario titular.");
          return;
        }
        if (propietariosControl.hasError("maxOwners")) {
          this.notification.warning("La venta permite un máximo de 3 propietarios.");
          return;
        }
      }

      // Debug de errores para identificar qué campo falta
      console.warn("--- DEBUG DE VALIDACIÓN DE FORMULARIO ---");
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.invalid) {
          console.log(`Campo inválido: [${key}]`, control.errors);
        }
      });
      if (this.form.errors) {
        console.log("Errores globales del formulario:", this.form.errors);
      }

      this.notification.warning(
        "Complete correctamente los campos requeridos.",
      );
      return;
    }

    this.loading = true;
    const rawData = this.form.getRawValue();

    this.ventaService.registrarNuevaVenta(rawData).subscribe({
      next: (response: any) => {
        this.notification.success("¡Venta registrada con éxito!");
        if (rawData.tipoPago === 'CONTADO' && response.data) {
          const ventaCreada = response.data;          
          // Obtenemos el nombre del titular desde la vista (que lo capturó al seleccionar)
          const nombreTitular = this.ventaView?.nombreTitular ?? 'Titular de la Venta';
          this.router.navigate(["/pagos/register"], {
            state: {
              ventaId: ventaCreada.id,
              nroVenta: ventaCreada.nroVenta,
              moneda: ventaCreada.moneda,
              tipoCambio: ventaCreada.tipoCambio,
              montoTotal: ventaCreada.montoTotal || rawData.montoTotal,
              saldoPendiente: ventaCreada.saldoPendiente,
              nombreCompletoCliente: nombreTitular,
              clienteId: rawData.propietarios?.find((p: any) => p.rol === 'TITULAR')?.clienteId ?? null,
              esContadoDirecto: true
            }
          })
        } else {
          this.router.navigate(["/ventas"]);
        }
      },
      error: (err) => {
        this.loading = false;
        const errorMessage =
          err.error?.message ||
          "Error al registrar la venta. Por favor intente de nuevo.";
        this.notification.error(errorMessage);
        console.error("Error en registro:", err);
      },
      complete: () => (this.loading = false),
    });
  }
}
