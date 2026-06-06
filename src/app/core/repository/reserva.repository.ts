import { inject, Injectable } from "@angular/core";
import { IReservaRepository } from "../interfaces/repository/reserva.repository.interface";
import { environment } from "src/environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { CreateReservaDto, ICancelReservaResponse, ICreateReservaResponse, IReserva, IUpdateReserva } from "../models/reserva.model";
import { Observable } from "rxjs";
import { IPermisoUpdate } from "../models/permiso.model";

@Injectable({ providedIn: 'root' })
export class ReservaRepository implements IReservaRepository {

    private readonly Api_Url = `${environment.apiUrl}/reservas`;

    private http = inject(HttpClient);

    create(dto: CreateReservaDto): Observable<ICreateReservaResponse> {
        return this.http.post<ICreateReservaResponse>(this.Api_Url, dto);
    }

    getAll(estado?: string, clienteId?: string, manzanaId?: string): Observable<IReserva[]> {
        let params = new HttpParams();        
        if (estado) params = params.set('estado', estado);
        if (clienteId) params = params.set('clienteId', clienteId);
        if (manzanaId) params = params.set('manzanaId', manzanaId);

        return this.http.get<IReserva[]>(this.Api_Url, { params });
    }

    getById(id: string): Observable<IReserva> {
        return this.http.get<IReserva>(`${this.Api_Url}/${id}`);
    }

    cancel(id: string): Observable<ICancelReservaResponse> {
        return this.http.patch<ICancelReservaResponse>(`${this.Api_Url}/${id}/cancelar`, {});
    }

    eliminar(id: string): Observable<any> {
        return this.http.delete<any>(`${this.Api_Url}/${id}`);
    }

    editar(id: string, dto: IUpdateReserva): Observable<IUpdateReserva> {
        return this.http.patch<IUpdateReserva>(`${this.Api_Url}/${id}`, dto);
    }

}