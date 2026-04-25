import { Inject, Injectable } from '@angular/core';
import { ReservaRepository } from '../repository/reserva.repository';
import { CreateReservaDto, ICancelReservaResponse, ICreateReservaResponse, IReserva } from '../models/reserva.model';
import { map, Observable } from 'rxjs';
export const RESERVA_REPOSITORY_TOKEN = 'IReservaRepository';
@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  constructor(@Inject(RESERVA_REPOSITORY_TOKEN) private repo: ReservaRepository) { }

  createReserva(dto: CreateReservaDto): Observable<ICreateReservaResponse> {
    return this.repo.create(dto);
  }

  getReservas(proyectoId?: string, estado?: string, clienteId?: string, manzanaId?: string): Observable<IReserva[]> {
    return this.repo.getAll(proyectoId, estado, clienteId, manzanaId).pipe(
      map((reservas) => reservas.map(r => ({
        ...r,
        id: r.reservaId || r.id // Normalización
      })))
    );
  }

  getReservaById(id: string): Observable<IReserva> {
    return this.repo.getById(id).pipe(
      map((reserva) => ({
        ...reserva,
        id: reserva.id || reserva.reservaId
      }))
    );
  }

  cancelReserva(id: string): Observable<ICancelReservaResponse> {
    return this.repo.cancel(id);
  }
}
