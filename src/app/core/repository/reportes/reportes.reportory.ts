import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IReporteRepository } from '../../interfaces/repository/reportes/reportes.repository.interface';
import { IAuditoriaReporte, IClienteReporte, IComisionReporte, IEstadoFinancieroReporte, ILoteReporte, ILoteReporteQuery, IOcupacionManzanaReporte, IPagoReporte, IPeriodoReporteQuery, IVentaReporte } from '../../models/reportes/reportes.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteRepository implements IReporteRepository {
  private readonly URL_BASE = 'https://urbancontrol.onrender.com/api/v1/reportes';

  constructor(private http: HttpClient) {}

  getLotes(filtros?: ILoteReporteQuery): Observable<ILoteReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.manzanaId) params = params.set('manzanaId', filtros.manzanaId);
      if (filtros.estado) params = params.set('estado', filtros.estado);
    }
    return this.http.get<ILoteReporte[]>(`${this.URL_BASE}/lotes`, { params });
  }

  getClientes(): Observable<IClienteReporte[]> {
    return this.http.get<IClienteReporte[]>(`${this.URL_BASE}/clientes`);
  }

  getVentas(filtros?: IPeriodoReporteQuery): Observable<IVentaReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    }
    return this.http.get<IVentaReporte[]>(`${this.URL_BASE}/ventas`, { params });
  }

  getPagos(filtros?: IPeriodoReporteQuery): Observable<IPagoReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    }
    return this.http.get<IPagoReporte[]>(`${this.URL_BASE}/pagos`, { params });
  }

  getEstadosFinancieros(): Observable<IEstadoFinancieroReporte[]> {
    return this.http.get<IEstadoFinancieroReporte[]>(`${this.URL_BASE}/estados-financieros`);
  }

  getComisiones(): Observable<IComisionReporte[]> {
    return this.http.get<IComisionReporte[]>(`${this.URL_BASE}/comisiones`);
  }

  getOcupacionManzanas(): Observable<IOcupacionManzanaReporte[]> {
    return this.http.get<IOcupacionManzanaReporte[]>(`${this.URL_BASE}/ocupacion-manzanas`);
  }

  getAuditoriaActividad(filtros?: IPeriodoReporteQuery): Observable<IAuditoriaReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaInicio) params = params.set('fechaInicio', filtros.fechaInicio);
      if (filtros.fechaFin) params = params.set('fechaFin', filtros.fechaFin);
    }
    return this.http.get<IAuditoriaReporte[]>(`${this.URL_BASE}/auditoria`, { params });
  }
}