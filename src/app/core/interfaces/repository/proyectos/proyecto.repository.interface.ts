import { Observable } from "rxjs";
import { IProyectoLookup } from "src/app/core/models/proyectos/proyecto.model";

export interface IProyectoRepository {
  getProyectosLookup(): Observable<IProyectoLookup[]>;
}
