// src/app/core/repository/actividades/actividades.repository.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IActividadesFiltrosDto, IActividadesResponse } from '../models/actividades.model';
import { IActividadesRepository } from '../interfaces/repository/actividades.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class ActividadesRepository implements IActividadesRepository {
  private readonly http = inject(HttpClient);
  private readonly endpointUrl = `${environment.apiUrl}/actividades`;

  public getActividadesRecientes(filtros: IActividadesFiltrosDto): Observable<IActividadesResponse> {
    let params = new HttpParams();

    if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros.accion) params = params.set('accion', filtros.accion);
    if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
    if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());

    return this.http.get<IActividadesResponse>(this.endpointUrl, { params });
  }
}