import { Observable } from "rxjs";
import { CreateReservaDto, ICancelReservaResponse, ICreateReservaResponse, IReserva } from "../../models/reserva.model";

export interface IReservaRepository {
    create(dto: CreateReservaDto): Observable<ICreateReservaResponse>;
    getAll(proyectoId?: string, estado?: string): Observable<IReserva[]>;
    getById(id: string): Observable<IReserva>;
    cancel(id: string): Observable<ICancelReservaResponse>;
}