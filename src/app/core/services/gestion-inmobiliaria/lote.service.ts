import { Injectable } from '@angular/core';
import { LoteRepository } from '../../repository/gestion-inmobiliaria/lote.repository';
import { map, Observable } from 'rxjs';
import { ILote } from '../../models/gestion-inmobiliaria/lotes.model';

@Injectable({
  providedIn: 'root'
})
export class LoteService {

constructor(private repository: LoteRepository) {}

  // Lógica: Traer lotes y quizás añadirle una propiedad calculada
  getLotesInmobiliarios(proyectoId: string): Observable<ILote[]> {
    return this.repository.getByProyecto(proyectoId).pipe(
      map(lotes => lotes.map(lote => ({
        ...lote,
        // Ejemplo de lógica de negocio: Precio total sugerido
        valorMercado: lote.superficieM2 * lote.proyecto.precioBaseM2
      })))
    );
  }

  softDeleteLote(id: string): Observable<any> {
    // Podrías añadir validaciones aquí antes de llamar al repo
    return this.repository.softDeleteLote(id);
  }

  createLote(lote: ILote):Observable<ILote>{
    return this.repository.create(lote);  
  }

  updateLote(id: string, lote: ILote): Observable<ILote> {
    return this.repository.update(id, lote);
  }
}
