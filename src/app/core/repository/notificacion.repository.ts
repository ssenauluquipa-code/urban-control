// src/app/core/repository/notificacion.repository.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { INotificacionRepository } from '../interfaces/repository/notificacion.repository.interface';
import { INotificacion, INotificacionResumen, INotificacionFilter } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionRepository implements INotificacionRepository {
  private http = inject(HttpClient);
  private readonly URL = `${environment.apiUrl}/api/v1/notificaciones`;

  getAll(filters?: INotificacionFilter): Observable<INotificacion[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.leida !== undefined) params = params.set('leida', String(filters.leida));
      if (filters.tipo) params = params.set('tipo', filters.tipo);
      if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta);
      if (filters.limit) params = params.set('limit', String(filters.limit));
    }

    return this.http.get<INotificacion[]>(this.URL, { params });
  }

  getResumen(): Observable<INotificacionResumen> {
    return this.http.get<INotificacionResumen>(`${this.URL}/resumen`);
  }

  getById(id: string): Observable<INotificacion> {
    return this.http.get<INotificacion>(`${this.URL}/${id}`);
  }

  marcarComoLeida(id: string): Observable<void> {
    return this.http.patch<void>(`${this.URL}/${id}/leer`, {});
  }

  marcarTodasComoLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.URL}/leer-todas`, {});
  }
}