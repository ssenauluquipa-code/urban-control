import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardVentasRepository } from '../repository/dashboard-ventas.repository';
import { IDashboardVentasFiltros, IDashboardVentasResponse } from '../models/dashboard-ventas.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardVentasService {
  // Inyectamos la implementación concreta siguiendo las pautas de tu arquitectura
  private dashboardVentasRepository = inject(DashboardVentasRepository);

  /**
   * Ejecuta las reglas de control y solicita la información analítica de ventas
   * mensuales necesarias para armar las visualizaciones de ApexCharts.
   * @param filtros Criterios reactivos del formulario (Rango ISO y Moneda destino)
   */
  public consultarEstadisticasMensuales(filtros: IDashboardVentasFiltros): Observable<IDashboardVentasResponse> {
    // Aquí puedes meter lógica de negocio adicional de ser necesario en el futuro
    // (Por ejemplo: formatear datos extras, cachear peticiones, lanzar validaciones locales, etc.)
    return this.dashboardVentasRepository.getVentasMensuales(filtros);
  }
}