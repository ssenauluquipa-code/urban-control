import { Observable } from "rxjs";
import { CreateLoteDto, ILote, ILoteByLoteDisponible, ILoteSearchResult, UpdateEstadoLoteDto, UpdateLoteDto } from "src/app/core/models/lote/lote.model";

export interface ILoteRepository {
  getAll(manzanaId?: string): Observable<ILote[]>;
  getById(id: string): Observable<ILote>;
  create(dto: CreateLoteDto): Observable<ILote>;
  update(id: string, dto: UpdateLoteDto): Observable<ILote>;
  delete(id: string): Observable<void>;
  updateEstado(id: string, dto: UpdateEstadoLoteDto): Observable<ILote>;
  uploadImages(id: string, files: File[]): Observable<ILote>; // Retorna el lote actualizado
  deleteImages(id: string, imageIds: string[]): Observable<void>;
  search(manzanaId: string, term: string): Observable<ILoteSearchResult[]>;
  disponibles(manzanaId?: string): Observable<ILoteByLoteDisponible[]>;
}
