import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, interval, Observable, of, Subject } from 'rxjs';
import { catchError, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { INotificacionRepository } from '../interfaces/repository/notificacion.repository.interface';
import { INotificacion, INotificacionResumen, INotificacionFilter } from '../models/notificacion.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { ProjectStatusGlobalService } from '../services/project-status-global.service';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

@Injectable({
  providedIn: 'root'
})
export class NotificacionRepository implements INotificacionRepository, OnDestroy {
  private http = inject(HttpClient);
  private globalProjectService = inject(ProjectStatusGlobalService);
  private readonly projectId$ = toObservable(this.globalProjectService.currentProjectId);
  private destroy$ = new Subject<void>();

  // `environment.apiUrl` ya incluye el prefijo `/api/v1` (en dev por proxy y en prod en el dominio),
  // por eso no se debe volver a agregar `/api/v1` aquí.
  private readonly URL = `${environment.apiUrl}/notificaciones`;

  // BehaviorSubject compartido — un solo polling para toda la app
  private resumen$ = new BehaviorSubject<INotificacionResumen>({
    totalNoLeidas: 0, cuotasPorVencer: 0, cuotasVencidas: 0, lotesLiberados: 0
  });

  constructor() {
    this.projectId$
      .pipe(
        switchMap((projectId) => {
          if (!projectId) return of(null);
          return interval(POLL_INTERVAL_MS).pipe(
            startWith(0),
            switchMap(() =>
              this.http.get<INotificacionResumen>(`${this.URL}/resumen`).pipe(
                catchError(() => of(null))
              )
            )
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((data) => {
        if (data) this.resumen$.next(data);
      });
  }

  getResumenStream(): Observable<INotificacionResumen> {
    return this.resumen$.asObservable();
  }

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
