import { Inject, Injectable } from '@angular/core';
import { CreateAsesorDto, IAsesor, UpdateAsesorDto } from '../models/asesor/asesor.model';
import { Observable } from 'rxjs';
import { IAsesorRepository } from '../interfaces/repository/asesor.repository.interface';

export const ASESOR_REPOSITORY_TOKEN = 'IAsesorRepository';

@Injectable({
  providedIn: 'root'
})
export class AsesorService {

  constructor(@Inject(ASESOR_REPOSITORY_TOKEN) private repo: IAsesorRepository) { }

  // Lista con filtros dinámicos
  getAsesores(term?: string, nroDocumento?: string, isActive?: boolean): Observable<IAsesor[]> {
    return this.repo.getAll(term, nroDocumento, isActive);
  }

  getAsesorById(id: string): Observable<IAsesor> {
    return this.repo.getById(id);
  }

  createAsesor(dto: CreateAsesorDto): Observable<IAsesor> {
    return this.repo.create(dto);
  }

  updateAsesor(id: string, dto: UpdateAsesorDto): Observable<IAsesor> {
    return this.repo.update(id, dto);
  }

  toggleStatus(id: string, currentStatus: boolean): Observable<void | IAsesor> {
    if (currentStatus) {
      return this.repo.delete(id);
    } else {
      return this.repo.activate(id);
    }
  }

}
