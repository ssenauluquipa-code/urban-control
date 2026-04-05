import { Injectable } from '@angular/core';
import { MazanaRepository } from '../../repository/proyectos/mazana-repository';
import { Observable } from 'rxjs';
import { IManzana, IManzanaCreateDto } from '../../models/proyectos/manzana.model';

@Injectable({
  providedIn: 'root'
})
export class ManzanaService {

constructor(private _repo: MazanaRepository) { }
getManzanasPorProyecto(proyectoId: string): Observable<IManzana[]> {
    return this._repo.getByProyecto(proyectoId);
  }

  obtenerDetalle(id: string): Observable<IManzana> {
    return this._repo.getById(id);
  }

  crearNuevaManzana(dto: IManzanaCreateDto): Observable<IManzana> {
    return this._repo.create(dto);
  }

  actualizarGeometria(id: string, geometria: string): Observable<void> {
    return this._repo.update(id, { geometria });
  }

  eliminar(id: string): Observable<void> {
    return this._repo.delete(id);
  }
}
