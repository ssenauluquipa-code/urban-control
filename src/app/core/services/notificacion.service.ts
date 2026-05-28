import { Inject, Injectable } from '@angular/core';
import { INotificacionRepository } from '../interfaces/repository/notificacion.repository.interface';
import { Observable } from 'rxjs';
import { INotificacion, INotificacionFilter, INotificacionResumen } from '../models/notificacion.model';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  // Aplicamos DIP: dependemos de la abstracción, no de la implementación de HttpClient
  constructor(
    @Inject('INotificacionRepository') private notiRepo: INotificacionRepository
  ) {}

  /**
   * Obtiene las notificaciones que se desplegarán de forma inmediata en el Dropdown de la campana.
   * Filtra por no leídas y aplica un límite por performance.
   */
  getAlertasMenuCampana(limite: number = 25): Observable<INotificacion[]> {
    return this.notiRepo.getAll({ limit: limite });
  }

  /**
   * Obtiene historial completo de notificaciones con filtros opcionales.
   */
  getHistorialNotificaciones(filters?: INotificacionFilter): Observable<INotificacion[]> {
    return this.notiRepo.getAll(filters);
  }

  /**
   * Obtiene el contador resumido para el Badge dinámico de alertas.
   * Retorna el stream compartido del repositorio (un solo polling para toda la app).
   */
  getContadorAlertas(): Observable<INotificacionResumen> {
    return this.notiRepo.getResumenStream();
  }

  /**
   * Cambia el estado de una única alerta al ser cliqueada o descartada.
   */
  marcarAlertaComoLeida(id: string): Observable<void> {
    return this.notiRepo.marcarComoLeida(id);
  }

  /**
   * Limpia el estado de lectura de forma masiva en el sistema.
   */
  limpiarTodasLasAlertas(): Observable<void> {
    return this.notiRepo.marcarTodasComoLeidas();
  }

  /**
   * Obtiene el detalle extendido para auditoría o vinculación de la alerta.
   */
  obtenerDetalleAlerta(id: string): Observable<INotificacion> {
    return this.notiRepo.getById(id);
  }
}
