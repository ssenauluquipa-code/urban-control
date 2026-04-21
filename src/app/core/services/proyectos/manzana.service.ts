import { Inject, Injectable } from '@angular/core';
import { IManzanaRepository } from '../../interfaces/repository/proyectos/manzana.repository.interface';
import { CreateManzanaDto, UpdateManzanaDto } from '../../models/manzana/manzana.model';


export const MANZANA_REPOSITORY_TOKEN = 'IManzanaRepository';

@Injectable({
  providedIn: 'root'
})
export class ManzanaService {

  constructor(@Inject(MANZANA_REPOSITORY_TOKEN) private repo: IManzanaRepository) { }

  getManzanas(proyectoId?: string) {
    return this.repo.getAll(proyectoId);
  }
  getManzanaById(id: string) { return this.repo.getById(id); }
  createManzana(dto: CreateManzanaDto) { return this.repo.create(dto); }
  updateManzana(id: string, dto: UpdateManzanaDto) { return this.repo.update(id, dto); }
  deleteManzana(id: string) { return this.repo.delete(id); }
  searchManzanas(proyectoId: string, term: string) { return this.repo.search(proyectoId, term); }

}
