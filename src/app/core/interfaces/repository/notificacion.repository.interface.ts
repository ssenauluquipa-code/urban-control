import { Observable } from "rxjs";
import { INotificacion, INotificacionFilter, INotificacionResumen } from "../../models/notificacion.model";

export interface INotificacionRepository {
  getAll(filters?: INotificacionFilter): Observable<INotificacion[]>;
  getResumen(): Observable<INotificacionResumen>;
  getResumenStream(): Observable<INotificacionResumen>;
  getById(id: string): Observable<INotificacion>;
  marcarComoLeida(id: string): Observable<void>;
  marcarTodasComoLeidas(): Observable<void>;
}
