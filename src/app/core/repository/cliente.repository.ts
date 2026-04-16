import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { IClienteRepository } from "../interfaces/repository/cliente.repository.interface";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CreateClienteDto, ICliente, IPagedResponse, UpdateClienteDto } from "../models/cliente.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ClienteRepository implements IClienteRepository {

  private readonly Api_URL = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) { }

  getAll(page: number, limit: number, term?: string, isActive?: boolean): Observable<IPagedResponse<ICliente>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    if (term) params = params.set('term', term);
    if (isActive !== undefined) params = params.set('isActive', isActive.toString());
    return this.http.get<IPagedResponse<ICliente>>(this.Api_URL, { params });
  }

  search(term: string): Observable<Partial<ICliente>[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Partial<ICliente>[]>(`${this.Api_URL}/search`, { params });
  }

  getById(id: string): Observable<ICliente> {
    return this.http.get<ICliente>(`${this.Api_URL}/${id}`);
  }

  create(dto: CreateClienteDto): Observable<ICliente> {
    return this.http.post<ICliente>(this.Api_URL, dto);
  }
  update(id: string, dto: UpdateClienteDto): Observable<ICliente> {
    return this.http.patch<ICliente>(`${this.Api_URL}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.Api_URL}/${id}`);
  }

  activate(id: string): Observable<ICliente> {
    return this.http.patch<ICliente>(`${this.Api_URL}/${id}/activate`, {});
  }

}
