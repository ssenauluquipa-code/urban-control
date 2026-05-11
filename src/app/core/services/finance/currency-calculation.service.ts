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
  roundCurrency(amount: number, decimals = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round((amount + Number.EPSILON) * factor) / factor;
  }

  convertAmount(
    amount: number,
    fromCurrency: Moneda,
    toCurrency: Moneda,
    exchangeRate: number,
  ): number {
    if (amount == null || Number.isNaN(amount)) return 0;
    if (!exchangeRate || exchangeRate <= 0) return 0;
    if (fromCurrency === toCurrency) return this.roundCurrency(amount);

    if (fromCurrency === Moneda.BS && toCurrency === Moneda.USD) {
      return this.roundCurrency(amount / exchangeRate);
    }

    if (fromCurrency === Moneda.USD && toCurrency === Moneda.BS) {
      return this.roundCurrency(amount * exchangeRate);
    }

    return this.roundCurrency(amount);
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
      montoTotalMonedaBase: this.convertAmount(
        montoTotal || 0,
        monedaOperacion,
        monedaBase,
        tipoCambio,
      ),
      cuotaInicialMonedaBase: this.convertAmount(
        cuotaInicial || 0,
        monedaOperacion,
        monedaBase,
        tipoCambio,
      ),
      saldoPendienteMonedaBase: this.convertAmount(
        saldoPendiente,
        monedaOperacion,
        monedaBase,
        tipoCambio,
      ),
    };
  }
}
