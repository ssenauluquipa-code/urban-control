import { Inject, Injectable } from '@angular/core';
import { IAuditoriaReporte, IClienteReporte, IComisionReporte, IEstadoFinancieroReporte, ILoteReporte, ILoteReporteQuery, IOcupacionManzanaReporte, IPagoReporte, IPeriodoReporteQuery, IVentaReporte } from '../../models/reportes/reportes.model';
import { Observable } from 'rxjs';
import { IReporteRepository } from '../../interfaces/repository/reportes/reportes.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(
    @Inject('IReporteRepository') private reporteRepo: IReporteRepository
  ) {}

  // 1
  obtenerReporteLotes(filtros?: ILoteReporteQuery): Observable<ILoteReporte[]> {
    return this.reporteRepo.getLotes(filtros);
  }

  // 2
  obtenerReporteClientes(): Observable<IClienteReporte[]> {
    return this.reporteRepo.getClientes();
  }

  // 3
  obtenerReporteVentas(filtros?: IPeriodoReporteQuery): Observable<IVentaReporte[]> {
    return this.reporteRepo.getVentas(filtros);
  }

  // 4
  obtenerReportePagos(filtros?: IPeriodoReporteQuery): Observable<IPagoReporte[]> {
    return this.reporteRepo.getPagos(filtros);
  }

  // 5
  obtenerEstadosFinancieros(): Observable<IEstadoFinancieroReporte[]> {
    return this.reporteRepo.getEstadosFinancieros();
  }

  // 6
  obtenerReporteComisiones(): Observable<IComisionReporte[]> {
    return this.reporteRepo.getComisiones();
  }

  // 7
  obtenerOcupacionManzanas(): Observable<IOcupacionManzanaReporte[]> {
    return this.reporteRepo.getOcupacionManzanas();
  }

  // 8
  obtenerAuditoriaActividad(filtros?: IPeriodoReporteQuery): Observable<IAuditoriaReporte[]> {
    return this.reporteRepo.getAuditoriaActividad(filtros);
  }
  
}
