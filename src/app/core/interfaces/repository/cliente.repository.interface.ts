import { Observable } from "rxjs";
import { CreateClienteDto, ICliente, IClienteSearchResult, IPagedResponse, UpdateClienteDto } from "../../models/cliente.model";

export interface IClienteRepository {

    getAll(page: number, limit: number, term?: string, isActive?: boolean): Observable<IPagedResponse<ICliente>>;

    search(term: string): Observable<IClienteSearchResult[]>;

    getById(id: string): Observable<ICliente>;

    create(dto: CreateClienteDto): Observable<ICliente>;

    update(id: string, dto: UpdateClienteDto): Observable<ICliente>;

    delete(id: string): Observable<void>;

    activate(id: string): Observable<ICliente>;
}
