import { Inject, Injectable } from '@angular/core';
import { IProyectoRepository } from '../../interfaces/repository/proyectos/proyecto.repository.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { CreateProyectoDto, IProyecto, IProyectoActivo, UpdateProyectoDto } from '../../models/proyectos/proyecto.model';
import { ProyectoMassLoadPayload } from '../../models/proyectos/proyecto-mass-load.interface';

export const PROYECTO_REPOSITORY_TOKEN = 'IProyectoRepository';

@Injectable({
  providedIn: 'root'
})
export class ProyectoService {

  private proyectosActivosSubject = new BehaviorSubject<IProyectoActivo[]>([]);
  public proyectosActivos$ = this.proyectosActivosSubject.asObservable();

  constructor(
    // Usamos @Inject con un string o token que Angular sí pueda reconocer
    @Inject('IProyectoRepository') private repo: IProyectoRepository
  ) { }

  getProyectos(): Observable<IProyecto[]> {
    return this.repo.getAll();
  }
  getProyectoById(id: string): Observable<IProyecto> { return this.repo.getById(id); }
  createProyecto(dto: CreateProyectoDto): Observable<IProyecto> {
    return this.repo.create(dto).pipe(
      tap(() => this.refreshProyectosActivos())
    );
  }
  updateProyecto(id: string, dto: UpdateProyectoDto): Observable<IProyecto> {
    return this.repo.update(id, dto).pipe(
      tap(() => this.refreshProyectosActivos())
    );
  }
  deleteProyecto(id: string): Observable<void> {
    return this.repo.delete(id).pipe(
      tap(() => this.refreshProyectosActivos())
    );
  }
  searchProyectos(term: string): Observable<IProyecto[]> { return this.repo.search(term); }

  getProyectosLookup(): Observable<{ id: string; nombre: string; }[]> {
    return this.repo.getProyectosLookup();
  }

  getProyectActive(): Observable<IProyectoActivo[]> {
    return this.repo.getProyectActive().pipe(
      tap(proyectos => this.proyectosActivosSubject.next(proyectos))
    );
  }

  createEstructuraProyecto(proyectoId: string, payload: ProyectoMassLoadPayload): Observable<any> {
    return this.repo.createEstructuraProyecto(proyectoId, payload);
  }

  private refreshProyectosActivos(): void {
    this.repo.getProyectActive().subscribe({
      next: (proyectos) => this.proyectosActivosSubject.next(proyectos),
      error: (error) => console.error('Error al refrescar proyectos activos', error)
    });
  }
}
