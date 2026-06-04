import { Injectable } from '@angular/core';
import { Moneda } from 'src/app/core/models/reserva.model';

export interface IVentaCalculationSummary {
  montoTotal: number;
  cuotaInicial: number;
  saldoPendiente: number;
  monedaOperacion: Moneda;
  monedaBase: Moneda;
  tipoCambio: number;
  montoTotalMonedaBase: number;
  cuotaInicialMonedaBase: number;
  saldoPendienteMonedaBase: number;
}

@Injectable({
  providedIn: 'root',
})
export class CurrencyCalculationService {

  // Constante para optimizar: No calcular Math.pow(10, 2) en cada llamada.
  private readonly FACTOR_DECIMALES = 100;

  roundCurrency(amount: number, decimals = 2): number {
    return Math.round((amount + Number.EPSILON) * this.FACTOR_DECIMALES) / this.FACTOR_DECIMALES;
  }

  /**
   * Convierte un monto monetario entre Moneda Origen (BS) y Moneda Destino (USD)
   * aplicando el tipo de cambio oficial y redondeo ROUND_HALF_UP (igual a Excel/Prisma).
   */
  convertirMonto(
    monto: number,
    monedaOrigen: Moneda,
    monedaDestino: Moneda,
    tipoCambio: number,
  ): number {
    if (monto == null || Number.isNaN(monto)) return 0;
    if (!tipoCambio || tipoCambio <= 0) return 0;

    // Si la moneda es la misma, no hay conversión, solo redondeo
    if (monedaOrigen === monedaDestino) {
      return this.roundCurrency(monto);
    }

    // Lógica de Conversión
    let resultadoRaw = 0;
    let operacion = '';

    if (monedaOrigen === Moneda.BS && monedaDestino === Moneda.USD) {
      // División (BS -> USD)
      operacion = `${monto} / ${tipoCambio}`;
      resultadoRaw = monto / tipoCambio;
    } else if (monedaOrigen === Moneda.USD && monedaDestino === Moneda.BS) {
      // Multiplicación (USD -> BS)
      operacion = `${monto} * ${tipoCambio}`;
      resultadoRaw = monto * tipoCambio;
    }

    const resultadoFinal = this.roundCurrency(resultadoRaw);

    return resultadoFinal;
  }

  calculateRemainingBalance(montoTotal: number, cuotaInicial: number): number {
    const total = Number(montoTotal || 0);
    const inicial = Number(cuotaInicial || 0);
    return this.roundCurrency(Math.max(total - inicial, 0));
  }

  calculateVentaSummary(
    montoTotal: number,
    cuotaInicial: number,
    monedaOperacion: Moneda,
    monedaBase: Moneda,
    tipoCambio: number,
  ): IVentaCalculationSummary {
    const saldoPendiente = this.calculateRemainingBalance(montoTotal, cuotaInicial);

    return {
      montoTotal: this.roundCurrency(montoTotal || 0),
      cuotaInicial: this.roundCurrency(cuotaInicial || 0),
      saldoPendiente,
      monedaOperacion,
      monedaBase,
      tipoCambio: this.roundCurrency(tipoCambio || 0, 4),
      montoTotalMonedaBase: this.convertirMonto(
        montoTotal || 0,
        monedaOperacion,
        monedaBase,
        tipoCambio,
      ),
      cuotaInicialMonedaBase: this.convertirMonto(
        cuotaInicial || 0,
        monedaOperacion,
        monedaBase,
        tipoCambio,
      ),
      saldoPendienteMonedaBase: this.convertirMonto(
        saldoPendiente,
        monedaOperacion,
        monedaBase,
        tipoCambio,
      ),
    };
  }
}