import { Inject, Injectable } from '@angular/core';
import { IProyectoRepository } from '../../interfaces/repository/proyectos/proyecto.repository.interface';
import { Observable } from 'rxjs';
import { CreateProyectoDto, IProyecto, IProyectoActivo, UpdateProyectoDto } from '../../models/proyectos/proyecto.model';

export const PROYECTO_REPOSITORY_TOKEN = 'IProyectoRepository';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

  constructor(
    // 👈 Usamos @Inject con un string o token que Angular sí pueda reconocer
    @Inject('IProyectoRepository') private repo: IProyectoRepository
  ) { }

  getProyectos(): Observable<IProyecto[]> {
    return this.repo.getAll();
  }
  getProyectoById(id: string): Observable<IProyecto> { return this.repo.getById(id); }
  createProyecto(dto: CreateProyectoDto): Observable<IProyecto> { return this.repo.create(dto); }
  updateProyecto(id: string, dto: UpdateProyectoDto): Observable<IProyecto> { return this.repo.update(id, dto); }
  deleteProyecto(id: string): Observable<void> { return this.repo.delete(id); }
  searchProyectos(term: string): Observable<IProyecto[]> { return this.repo.search(term); }

  getProyectosLookup(): Observable<{ id: string; nombre: string; }[]> {
    return this.repo.getProyectosLookup();
  }

  getProyectActive(): Observable<IProyectoActivo[]> {
    return this.repo.getProyectActive();
  }
}
