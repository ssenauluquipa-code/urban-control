import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getReservas(filtros?: IPeriodoReporteQuery): Observable<IReservaReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    }
    return this.http.get<IReservaReporte[]>(`${this.URL_BASE}/reservas`, { params });
  }

  getVentas(filtros?: ITermPeriodoReporteQuery): Observable<IVentaReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.term) params = params.set('term', filtros.term);
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    }
    return this.http.get<IVentaReporte[]>(`${this.URL_BASE}/ventas`, { params });
  }

  getPagos(filtros?: IPeriodoReporteQuery): Observable<IPagoReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    }
    return this.http.get<IPagoReporte[]>(`${this.URL_BASE}/pagos`, { params });
  }

  getCuotasPendientes(filtros?: ICuotasPendientesQuery): Observable<ICuotaPendienteReporte[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.vencimientoDesde) params = params.set('vencimientoDesde', filtros.vencimientoDesde);
      if (filtros.vencimientoHasta) params = params.set('vencimientoHasta', filtros.vencimientoHasta);
      if (filtros.term) params = params.set('term', filtros.term);
    }
    return this.http.get<ICuotaPendienteReporte[]>(`${this.URL_BASE}/cuotas-pendientes`, { params });
  }

  getClientesMora(term?: string): Observable<IClienteMoraReporte[]> {
    let params = new HttpParams();
    if (term) params = params.set('term', term);
    return this.http.get<IClienteMoraReporte[]>(`${this.URL_BASE}/clientes-mora`, { params });
  }

  getVentasAsesor(moneda: string): Observable<IVentasAsesorReporte[]> {
    let params = new HttpParams().set('moneda', moneda);
    return this.http.get<IVentasAsesorReporte[]>(`${this.URL_BASE}/ventas-asesor`, { params });
  }
}