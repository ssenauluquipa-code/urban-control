import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import {
  CreateVentaPropietarioDto,
  FrecuenciaPago,
  RolPropietario,
  TipoPago,
} from "src/app/core/models/venta.model";

/** Valida propietarios: máx. 3, sin duplicados y un solo titular. */
export function propietariosVentaValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const propietarios = control.value as CreateVentaPropietarioDto[] | null;

  if (!propietarios || propietarios.length === 0) {
    return null;
  }

  if (propietarios.length > 3) {
    return { maxOwners: true };
  }

  const clienteIds = propietarios
    .map((item) => item?.clienteId)
    .filter(Boolean);
  if (new Set(clienteIds).size !== clienteIds.length) {
    return { duplicateOwners: true };
  }

  const titulares = propietarios.filter(
    (item) => item?.rol === RolPropietario.TITULAR,
  ).length;
  if (titulares !== 1) {
    return { invalidTitularCount: true };
  }

  return null;
}

/** En CUOTAS, la cuota inicial no puede superar el monto total. */
export function cuotaInicialNoMayorAlMontoTotalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tipoPago = control.get("tipoPago")?.value;
    const montoTotal = Number(control.get("montoTotal")?.value || 0);
    const cuotaInicialValue = control.get("cuotaInicial")?.value;

    if (tipoPago !== TipoPago.CUOTAS || cuotaInicialValue == null) {
      return null;
    }

    const cuotaInicial = Number(cuotaInicialValue || 0);
    if (cuotaInicial > montoTotal) {
      return { cuotaInicialExceedsTotal: true };
    }

    return null;
  };
}

/** En quincenal con días fijos, diaPagoMes1 y diaPagoMes2 deben ser distintos. */
export function diasPagoQuincenalValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const tipoPago = control.get("tipoPago")?.value;
    const frecuenciaPago = control.get("frecuenciaPago")?.value;
    const modalidadCalendarioPago = control.get(
      "modalidadCalendarioPago",
    )?.value;
    const diaPagoMes1 = control.get("diaPagoMes1")?.value;
    const diaPagoMes2 = control.get("diaPagoMes2")?.value;

    if (
      tipoPago !== TipoPago.CUOTAS ||
      frecuenciaPago !== FrecuenciaPago.QUINCENAL ||
      modalidadCalendarioPago !== "DIAS_FIJOS_MES"
    ) {
      return null;
    }

    if (
      diaPagoMes1 != null &&
      diaPagoMes2 != null &&
      diaPagoMes1 === diaPagoMes2
    ) {
      return { duplicatedPaymentDays: true };
    }

    return null;
  };
}
