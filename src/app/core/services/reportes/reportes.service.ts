import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IReporteRepository } from '../../interfaces/repository/reportes/reportes.repository.interface';
import { 
  IClienteMoraReporte, IClienteReporte, ICuotaPendienteReporte, ICuotasPendientesQuery, 
  ILoteReporte, ILoteReporteQuery, IPagoReporte, IPeriodoReporteQuery, 
  IReservaReporte, ITermPeriodoReporteQuery, IVentaReporte, IVentasAsesorReporte 
} from '../../models/reportes/reportes.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(
    @Inject('IReporteRepository') private reporteRepo: IReporteRepository
  ) {}

  // 1. Reporte de Lotes
  obtenerReporteLotes(filtros?: ILoteReporteQuery): Observable<ILoteReporte[]> {
    return this.reporteRepo.getLotes(filtros);
  }

  // 2. Reporte de Clientes
  obtenerReporteClientes(): Observable<IClienteReporte[]> {
    return this.reporteRepo.getClientes();
  }

  // 3. Reporte de Reservas
  obtenerReporteReservas(filtros?: IPeriodoReporteQuery): Observable<IReservaReporte[]> {
    return this.reporteRepo.getReservas(filtros);
  }

  // 4. Reporte General de Ventas
  obtenerReporteVentas(filtros?: ITermPeriodoReporteQuery): Observable<IVentaReporte[]> {
    return this.reporteRepo.getVentas(filtros);
  }

  // 5. Reporte de Pagos
  obtenerReportePagos(filtros?: IPeriodoReporteQuery): Observable<IPagoReporte[]> {
    return this.reporteRepo.getPagos(filtros);
  }

  // 6. Reporte de Cuotas Pendientes
  obtenerReporteCuotasPendientes(filtros?: ICuotasPendientesQuery): Observable<ICuotaPendienteReporte[]> {
    return this.reporteRepo.getCuotasPendientes(filtros);
  }

  // 7. Reporte de Clientes en Mora
  obtenerReporteClientesMora(term?: string): Observable<IClienteMoraReporte[]> {
    return this.reporteRepo.getClientesMora(term);
  }

  // 8. Reporte de Ventas por Asesor
  obtenerReporteVentasAsesor(moneda: string): Observable<IVentasAsesorReporte[]> {
    return this.reporteRepo.getVentasAsesor(moneda);
  }
}