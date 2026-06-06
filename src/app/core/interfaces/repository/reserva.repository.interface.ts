import { Observable } from "rxjs";
import { CreateReservaDto, ICancelReservaResponse, ICreateReservaResponse, IReserva, IUpdateReserva } from "../../models/reserva.model";

export interface IReservaRepository {
    create(dto: CreateReservaDto): Observable<ICreateReservaResponse>;
    getAll(estado?: string, clienteId?: string, manzanaId?: string): Observable<IReserva[]>;
    getById(id: string): Observable<IReserva>;
    cancel(id: string): Observable<ICancelReservaResponse>;
    eliminar(id: string): Observable<any>;
    editar(id: string, dto: IUpdateReserva): Observable<IUpdateReserva>;
}