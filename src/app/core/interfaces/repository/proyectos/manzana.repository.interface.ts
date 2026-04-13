import { Observable } from "rxjs";
import { CreateManzanaDto, IManzana, UpdateManzanaDto } from "src/app/core/models/manzana/manzana.model";

export interface IManzanaRepository {
  getAll(proyectoId?: string): Observable<IManzana[]>;
  getById(id: string): Observable<IManzana>;
  create(dto: CreateManzanaDto): Observable<IManzana>;
  update(id: string, dto: UpdateManzanaDto): Observable<IManzana>;
  delete(id: string): Observable<void>;
  search(proyectoId: string, term: string): Observable<IManzana[]>;
}
