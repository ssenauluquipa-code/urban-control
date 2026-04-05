import { Observable } from 'rxjs';
import { ILote } from 'src/app/core/models/gestion-inmobiliaria/lotes.model';
export interface ILoteRepository {
  // Coincide con: GET /api/Lote/proyecto/{proyectoId}
  getByProyecto(proyectoId: string): Observable<ILote[]>;

  // Coincide con: POST /api/Lote
  create(lote: ILote): Observable<ILote>;

  // Coincide con: PATCH /api/Lote/{id}/estado
  softDeleteLote(id: string): Observable<any>;

  update(id: string, lote: ILote): Observable<ILote>;
 }
