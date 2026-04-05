import { Observable } from "rxjs";
import { ICreateLoteDto, ILote } from "../../models/gestion-inmobiliaria/lotes.model";
import { environment } from "src/environments/environment.prod";
import { HttpClient } from "@angular/common/http";
import { ILoteRepository } from "../../interfaces/repository/gestion-inmobiliaria/lote.repository.interface";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class LoteRepository implements ILoteRepository {
  private readonly API_URL = `${environment.apiUrl}/Lote`;

  constructor(private http: HttpClient) {}
  getByProyecto(proyectoId: string): Observable<ILote[]> {
    return this.http.get<ILote[]>(`${this.API_URL}/proyecto/${proyectoId}`);
  }

  create(lote: ILote): Observable<ILote> {
    return this.http.post<ILote>(this.API_URL, lote);
  }

  softDeleteLote(id: string): Observable<any> {
    // Tu backend espera un PATCH /api/Lote/{id}/estado
    return this.http.patch(`${this.API_URL}/${id}/estado`, {estado: 'Eliminado'}, {responseType: 'text'});
  }

  update(id: string, lote: ILote): Observable<ILote> {
    return this.http.put<ILote>(`${this.API_URL}/${id}`, lote);
  }

}
