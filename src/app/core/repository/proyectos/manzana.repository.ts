import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CreateManzanaDto, IManzana, IManzanaSearchResult, UpdateManzanaDto } from "../../models/manzana/manzana.model";
import { IManzanaRepository } from "../../interfaces/repository/proyectos/manzana.repository.interface";
import { ProjectStatusGlobalService } from "../../services/project-status-global.service";

@Injectable({
  providedIn: 'root'
})
export class ManzanaRepository implements IManzanaRepository {
  private readonly API_URL = `${environment.apiUrl}/manzanas`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<IManzana[]> {
    return this.http.get<IManzana[]>(this.API_URL);
  }

  getById(id: string): Observable<IManzana> { return this.http.get<IManzana>(`${this.API_URL}/${id}`); }

  create(dto: CreateManzanaDto): Observable<IManzana> { return this.http.post<IManzana>(this.API_URL, dto); }

  update(id: string, dto: UpdateManzanaDto): Observable<IManzana> { return this.http.patch<IManzana>(`${this.API_URL}/${id}`, dto); }

  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.API_URL}/${id}`); }

  /**
   * CORREGIDO: Buscador limpio por término. 
   * La cabecera X-Project-Id la manejará automáticamente el interceptor.
   */
  search(term: string): Observable<IManzanaSearchResult[]> {
    const params = new HttpParams().set('term', term || '');
    return this.http.get<IManzanaSearchResult[]>(`${this.API_URL}/search`, { params });
  }
}
