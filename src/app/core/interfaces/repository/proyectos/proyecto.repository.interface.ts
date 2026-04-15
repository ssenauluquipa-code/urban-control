import { Observable } from "rxjs";
import { CreateProyectoDto, IProyecto, IProyectoActivo, UpdateProyectoDto } from "src/app/core/models/proyectos/proyecto.model";

export interface IProyectoRepository {
  getAll(): Observable<IProyecto[]>;
  getById(id: string): Observable<IProyecto>;
  create(dto: CreateProyectoDto): Observable<IProyecto>;
  update(id: string, dto: UpdateProyectoDto): Observable<IProyecto>;
  delete(id: string): Observable<void>;
  search(term: string): Observable<IProyecto[]>;
  getProyectosLookup(): Observable<{ id: string; nombre: string }[]>;

  getProyectActive(): Observable<IProyectoActivo[]>;
}
