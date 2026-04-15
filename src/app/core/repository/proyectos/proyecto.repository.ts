import { Observable, map } from "rxjs";
import { IProyectoRepository } from "../../interfaces/repository/proyectos/proyecto.repository.interface";
import { CreateProyectoDto, IProyecto, IProyectoActivo, UpdateProyectoDto } from "../../models/proyectos/proyecto.model";
import { environment } from "src/environments/environment.prod";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ProyectoRepository implements IProyectoRepository {

  private readonly API_URL = `${environment.apiUrl}/proyectos`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<IProyecto[]> { return this.http.get<IProyecto[]>(this.API_URL); }

  getById(id: string): Observable<IProyecto> { return this.http.get<IProyecto>(`${this.API_URL}/${id}`); }

  create(dto: CreateProyectoDto): Observable<IProyecto> { return this.http.post<IProyecto>(this.API_URL, dto); }

  update(id: string, dto: UpdateProyectoDto): Observable<IProyecto> { return this.http.patch<IProyecto>(`${this.API_URL}/${id}`, dto); }

  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.API_URL}/${id}`); }

  search(term: string): Observable<IProyecto[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<IProyecto[]>(`${this.API_URL}/search`, { params });
  }

  getProyectosLookup(): Observable<{ id: string; nombre: string }[]> {
    return this.http.get<{ id: string; name: string }[]>(`${this.API_URL}/lookup`).pipe(
      map(response => response.map(p => ({ id: p.id, nombre: p.name })))
    );
  }

  getProyectActive(): Observable<IProyectoActivo[]> {
    return this.http.get<IProyectoActivo[]>(`${this.API_URL}/activos`);
  }

}
