import { Inject, Injectable } from '@angular/core';
import { IClienteRepository } from '../interfaces/repository/cliente.repository.interface';
import { Observable } from 'rxjs';
import { CreateClienteDto, ICliente, IClienteSearchResult, IPagedResponse, UpdateClienteDto } from '../models/cliente.model';

export const CLIENTE_REPOSITORY_TOKEN = 'IClienteRepository';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  constructor(@Inject(CLIENTE_REPOSITORY_TOKEN) private repo: IClienteRepository) { }

  getPagedClients(page: number, limit: number, term?: string, isActive?: boolean): Observable<IPagedResponse<ICliente>> {
    return this.repo.getAll(page, limit, term, isActive);
  }

  getClientById(id: string): Observable<ICliente> {
    return this.repo.getById(id);
  }

  createClient(dto: CreateClienteDto): Observable<ICliente> {
    return this.repo.create(dto);
  }
  updateClient(id: string, dto: UpdateClienteDto): Observable<ICliente> {
    return this.repo.update(id, dto);
  }

  toggleStatus(id: string, currentStatus: boolean): Observable<void | ICliente> {
    if (currentStatus) {
      return this.repo.delete(id);
    } else {
      return this.repo.activate(id);
    }
  }
  //Nuevo: Para selectores/autocompletado (búsqueda rápida)
  searchClients(term: string): Observable<IClienteSearchResult[]> {
    return this.repo.search(term);
  }
}
