import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CreateManzanaDto, IManzana, UpdateManzanaDto } from "../../models/manzana/manzana.model";
import { IManzanaRepository } from "../../interfaces/repository/proyectos/manzana.repository.interface";

@Injectable({
  providedIn: 'root'
})
export class ManzanaRepository implements IManzanaRepository {
  private readonly API_URL = `${environment.apiUrl}/manzana`;

  constructor(private http: HttpClient) {}

  // Si pasa proyectoId, agrega el query param ?proyectoId=...
  getAll(proyectoId?: string): Observable<IManzana[]> {
    let params = new HttpParams();
    if (proyectoId) params = params.set('proyectoId', proyectoId);
    return this.http.get<IManzana[]>(this.API_URL, { params });
  }

  getById(id: string): Observable<IManzana> { return this.http.get<IManzana>(`${this.API_URL}/${id}`); }

  create(dto: CreateManzanaDto): Observable<IManzana> { return this.http.post<IManzana>(this.API_URL, dto); }

  update(id: string, dto: UpdateManzanaDto): Observable<IManzana> { return this.http.patch<IManzana>(`${this.API_URL}/${id}`, dto); }

  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.API_URL}/${id}`); }

  search(proyectoId: string, term: string): Observable<IManzana[]> {
    const params = new HttpParams().set('proyectoId', proyectoId).set('term', term);
    return this.http.get<IManzana[]>(`${this.API_URL}/search`, { params });
  }
}
