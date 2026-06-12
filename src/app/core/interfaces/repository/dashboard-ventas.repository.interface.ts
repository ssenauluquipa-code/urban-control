import { Observable } from 'rxjs';
import { IDashboardVentasFiltros, IDashboardVentasResponse } from '../../models/dashboard-ventas.model';

/**
 * Contrato abstracto para el repositorio de métricas del Dashboard.
 * Aplica el principio de inversión de dependencias (DIP).
 */
export interface IDashboardVentasRepository {
  /**
   * Realiza la petición cruda de red para obtener las ventas mensuales analíticas.
   * @param filtros Criterios opcionales de rango de fechas y divisa.
   */
  getVentasMensuales(filtros: IDashboardVentasFiltros): Observable<IDashboardVentasResponse>;
}