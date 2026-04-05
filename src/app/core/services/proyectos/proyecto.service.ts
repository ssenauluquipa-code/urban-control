import { Inject, Injectable } from '@angular/core';
import { IProyectoRepository } from '../../interfaces/repository/proyectos/proyecto.repository.interface';
import { Observable } from 'rxjs';
import { IProyectoLookup } from '../../models/proyectos/proyecto.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

constructor(
    // 👈 Usamos @Inject con un string o token que Angular sí pueda reconocer
    @Inject('IProyectoRepository') private _repository: IProyectoRepository
  ) {}

  getProyectosLookup(): Observable<IProyectoLookup[]> {
    return this._repository.getProyectosLookup();
  }
}
