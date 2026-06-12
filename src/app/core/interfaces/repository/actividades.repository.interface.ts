// src/app/core/interfaces/repository/actividades/actividades.repository.interface.ts

import { Observable } from 'rxjs';
import { IActividadesFiltrosDto, IActividadesResponse } from '../../models/actividades.model';

export interface IActividadesRepository {
  getActividadesRecientes(filtros: IActividadesFiltrosDto): Observable<IActividadesResponse>;
}