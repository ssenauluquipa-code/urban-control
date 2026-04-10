import { Inject, Injectable } from '@angular/core';
import { IOrganization, UpdateOrganizationDto } from '../../models/Empresas/empresa-config.model';
import { Observable } from 'rxjs';
import { IOrganizationRepository } from '../../interfaces/repository/Configuracion/organization.repository.interface';

export const ORGANIZATION_REPOSITORY_TOKEN = 'IOrganizationRepository';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  constructor(
    @Inject(ORGANIZATION_REPOSITORY_TOKEN) private repository: IOrganizationRepository
  ) { }
getEmpresa(): Observable<IOrganization> {
    return this.repository.get();
  }

  updateEmpresa(config: UpdateOrganizationDto): Observable<IOrganization> {
    // Aquí podrías añadir lógica: ej. verificar si el usuario tiene permiso Admin
    return this.repository.update(config);
  }
}
