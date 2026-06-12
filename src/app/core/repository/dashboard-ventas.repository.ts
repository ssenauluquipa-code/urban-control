import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IDashboardVentasFiltros, IDashboardVentasResponse } from '../models/dashboard-ventas.model';
import { IDashboardVentasRepository } from '../interfaces/repository/dashboard-ventas.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardVentasRepository implements IDashboardVentasRepository {
  private http = inject(HttpClient);
  private readonly endpointUrl = `${environment.apiUrl}/dashboard/ventas-mensuales`;

  public getVentasMensuales(filtros: IDashboardVentasFiltros): Observable<IDashboardVentasResponse> {
    let params = new HttpParams();

    if (filtros.fechaDesde) {
      params = params.set('fechaDesde', filtros.fechaDesde);
    }
    if (filtros.fechaHasta) {
      params = params.set('fechaHasta', filtros.fechaHasta);
    }
    if (filtros.moneda) {
      params = params.set('moneda', filtros.moneda);
    }

    // Los interceptores de red globales inyectarán automáticamente:
    // 1. Authorization: Bearer <token>
    // 2. X-Project-Id: <projectId> (Contexto de Proyecto Activo)
    return this.http.get<IDashboardVentasResponse>(this.endpointUrl, { params });
  }
}