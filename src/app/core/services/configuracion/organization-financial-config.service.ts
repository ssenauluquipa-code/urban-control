import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrganizationService } from './organization.service';

export interface IOrganizationFinancialConfig {
  currency: string;
  exchangeRate: number;
  reservationDueDays: number;
  plazoMaximoMeses: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrganizationFinancialConfigService {
  constructor(private organizationService: OrganizationService) {}

  getFinancialConfig(): Observable<IOrganizationFinancialConfig> {
    return this.organizationService.getEmpresa().pipe(
      map((empresa) => ({
        currency: empresa.currency,
        exchangeRate: empresa.tipoDeCambio,
        reservationDueDays: empresa.diasVencimientoReserva,
        plazoMaximoMeses: empresa.plazoMaximoMeses,
      })),
    );
  }

  getBaseCurrency(): Observable<string> {
    return this.getFinancialConfig().pipe(map((config) => config.currency));
  }

  getExchangeRate(): Observable<number> {
    return this.getFinancialConfig().pipe(map((config) => config.exchangeRate));
  }

  getReservationDueDays(): Observable<number> {
    return this.getFinancialConfig().pipe(
      map((config) => config.reservationDueDays),
    );
  }
}
