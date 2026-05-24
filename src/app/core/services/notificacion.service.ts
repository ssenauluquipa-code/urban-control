import { Inject, Injectable } from '@angular/core';
import { INotificacionRepository } from '../interfaces/repository/notificacion.repository.interface';
import { Observable } from 'rxjs';
import { INotificacion, INotificacionResumen } from '../models/notificacion.model';

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
    return this.notiRepo.getAll({ leida: false, limit: limite });
  }

  /**
   * Obtiene el contador resumido para el Badge dinámico de alertas.
   */
  getContadorAlertas(): Observable<INotificacionResumen> {
    return this.notiRepo.getResumen();
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
