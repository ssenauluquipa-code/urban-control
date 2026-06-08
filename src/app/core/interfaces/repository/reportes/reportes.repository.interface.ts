import { Observable } from 'rxjs';
import { IAuditoriaReporte, IClienteReporte, IComisionReporte, IEstadoFinancieroReporte, ILoteReporte, ILoteReporteQuery, IOcupacionManzanaReporte, IPagoReporte, IPeriodoReporteQuery, IVentaReporte } from 'src/app/core/models/reportes/reportes.model';

export interface IReporteRepository {
  getLotes(filtros?: ILoteReporteQuery): Observable<ILoteReporte[]>;
  getClientes(): Observable<IClienteReporte[]>;
  getVentas(filtros?: IPeriodoReporteQuery): Observable<IVentaReporte[]>;
  getPagos(filtros?: IPeriodoReporteQuery): Observable<IPagoReporte[]>;
  getEstadosFinancieros(): Observable<IEstadoFinancieroReporte[]>;
  getComisiones(): Observable<IComisionReporte[]>;
  getOcupacionManzanas(): Observable<IOcupacionManzanaReporte[]>;
  getAuditoriaActividad(filtros?: IPeriodoReporteQuery): Observable<IAuditoriaReporte[]>;
}