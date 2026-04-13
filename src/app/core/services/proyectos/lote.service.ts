import { Inject, Injectable } from '@angular/core';
import { CreateLoteDto, UpdateEstadoLoteDto, UpdateLoteDto, ILote } from '../../models/lote/lote.model';
import { ILoteRepository } from '../../interfaces/repository/proyectos/lote.repository.interface';
import { Observable, map } from 'rxjs';

export const LOTE_REPOSITORY_TOKEN = 'ILoteRepository';

@Injectable({
  providedIn: 'root'
})
export class LoteService {

constructor(@Inject(LOTE_REPOSITORY_TOKEN) private repo : ILoteRepository) { }

getLotes(manzanaId: string): Observable<ILote[]> { return this.repo.getAll(manzanaId); }

getLotesInmobiliarios(proyectoId: string): Observable<ILote[]> {
  return this.repo.getAll().pipe(
    map(lotes => lotes.filter(lote => lote.proyectoId === proyectoId))
  );
}

getLoteById(id: string): Observable<ILote> { return this.repo.getById(id); }
createLote(dto: CreateLoteDto): Observable<ILote> { return this.repo.create(dto); }
updateLote(id: string, dto: UpdateLoteDto): Observable<ILote> { return this.repo.update(id, dto); }
deleteLote(id: string): Observable<void> { return this.repo.delete(id); }
updateEstadoLote(id: string, dto: UpdateEstadoLoteDto): Observable<ILote> { return this.repo.updateEstado(id, dto); }
uploadLoteImages(id: string, files: File[]): Observable<ILote> { return this.repo.uploadImages(id, files); }
deleteLoteImages(id: string, imageIds: string[]): Observable<void> { return this.repo.deleteImages(id, imageIds); }
searchLotes(manzanaId: string, term: string): Observable<ILote[]> { return this.repo.search(manzanaId, term); }

}
