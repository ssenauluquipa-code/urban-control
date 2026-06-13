import { Observable } from 'rxjs';
import { IClienteMoraReporte, IClienteReporte, ICuotaPendienteReporte, ICuotasPendientesQuery, ILoteReporte, ILoteReporteQuery, IPagoReporte, IPeriodoReporteQuery, IReservaReporte, ITermPeriodoReporteQuery, IVentaReporte, IVentasAsesorReporte } from 'src/app/core/models/reportes/reportes.model';


export interface IReporteRepository {
  getLotes(filtros?: ILoteReporteQuery): Observable<ILoteReporte[]>;
  getClientes(): Observable<IClienteReporte[]>;
  getReservas(filtros?: IPeriodoReporteQuery): Observable<IReservaReporte[]>;
  getVentas(filtros?: ITermPeriodoReporteQuery): Observable<IVentaReporte[]>;
  getPagos(filtros?: IPeriodoReporteQuery): Observable<IPagoReporte[]>;
  getCuotasPendientes(filtros?: ICuotasPendientesQuery): Observable<ICuotaPendienteReporte[]>;
  getClientesMora(term?: string): Observable<IClienteMoraReporte[]>;
  getVentasAsesor(moneda: string): Observable<IVentasAsesorReporte[]>;
}