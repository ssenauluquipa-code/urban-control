import { Observable } from "rxjs";
import { IManzana, IManzanaCreateDto, IManzanaUpdateDto } from "src/app/core/models/proyectos/manzana.model";

export interface IManzanaRepository {
  getByProyecto(proyectoId: string): Observable<IManzana[]>;
  getById(id: string): Observable<IManzana>;
  create(dto: IManzanaCreateDto): Observable<IManzana>;
  update(id: string, dto: IManzanaUpdateDto): Observable<void>;
  delete(id: string): Observable<void>;
}
