import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateLoteDto, ILote, UpdateEstadoLoteDto, UpdateLoteDto } from "../../models/lote/lote.model";
import { ILoteRepository } from "../../interfaces/repository/proyectos/lote.repository.interface";

@Injectable({ providedIn: 'root' })
export class LoteRepository implements ILoteRepository {

  private readonly API_URL = `${environment.apiUrl}/lotes`;

  constructor(private http: HttpClient) {}

  getAll(manzanaId?: string): Observable<ILote[]> {
    let params = new HttpParams();
    if (manzanaId) params = params.set('manzanaId', manzanaId);
    return this.http.get<ILote[]>(this.API_URL, { params });
  }

  getById(id: string): Observable<ILote> { return this.http.get<ILote>(`${this.API_URL}/${id}`); }

  create(dto: CreateLoteDto): Observable<ILote> { return this.http.post<ILote>(this.API_URL, dto); }

  update(id: string, dto: UpdateLoteDto): Observable<ILote> { return this.http.patch<ILote>(`${this.API_URL}/${id}`, dto); }

  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.API_URL}/${id}`); }

  updateEstado(id: string, dto: UpdateEstadoLoteDto): Observable<ILote> {
    return this.http.patch<ILote>(`${this.API_URL}/${id}/estado`, dto);
  }

  // Manejo de imágenes con FormData
  uploadImages(id: string, files: File[]): Observable<ILote> {
    const formData = new FormData();
    files.forEach(file => formData.append('imagenes', file)); // 'imagenes' es el nombre del campo según Swagger
    return this.http.post<ILote>(`${this.API_URL}/${id}/imagenes`, formData);
  }

  deleteImages(id: string, imageIds: string[]): Observable<void> {
    // El swagger indica un body con { imagenIds: [...] }
    return this.http.request<void>('DELETE', `${this.API_URL}/${id}/imagenes`, { body: { imagenIds: imageIds } });
  }

  search(manzanaId: string, term: string): Observable<ILote[]> {
    const params = new HttpParams().set('manzanaId', manzanaId).set('term', term);
    return this.http.get<ILote[]>(`${this.API_URL}/search`, { params });
  }

}
