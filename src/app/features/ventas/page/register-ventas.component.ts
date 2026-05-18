import { ChangeDetectorRef, Component, inject } from "@angular/core";
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
      ></app-register-venta-view>
    </app-page-container>
  `,
  styles: ``,
})
export class RegisterVentasComponent {
  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private notification = inject(NotificationService);
  private loteService = inject(LoteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaService = inject(ReservaService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('ventaView') ventaView!: RegisterVentaViewComponent;

  loading = false;

  form: FormGroup = this.fb.group(
    {
      loteId: [null, [Validators.required]],
      reservaId: [null],
      tipoPago: [TipoPago.CONTADO, [Validators.required]],
      moneda: ["BS", [Validators.required]],
      montoTotal: [{ value: 0, disabled: true }, [Validators.required]],
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

  constructor() {
    this.listenFormChanges();
    this.updateFinancingValidators(this.form.get("tipoPago")?.value);
  }




  private listenFormChanges() {
    this.form.get("loteId")?.valueChanges.subscribe((id) => {
      if (id) {
        this.loteService.getLoteById(id).subscribe((lote) => {
          this.form.patchValue({ montoTotal: lote.precioReferencial });
          this.form.updateValueAndValidity({ emitEvent: false });
        });
      } else {
        this.form.patchValue({ montoTotal: 0 });
        this.form.updateValueAndValidity({ emitEvent: false });
      }
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
  }

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
      this.form.get("cuotaInicial")?.setValidators([Validators.required, Validators.min(0)]);
      this.form.get("frecuenciaPago")?.setValidators([Validators.required]);
      this.form.get("nroCuotas")?.setValidators([Validators.required, Validators.min(1), Validators.max(600)]);
      this.form.get("fechaPagoInicial")?.setValidators([Validators.required]);

      const frecuencia = this.form.get("frecuenciaPago")?.value;
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
      next: () => {
        this.notification.success("¡Venta registrada con éxito!");
        this.router.navigate(["/ventas"]);
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
