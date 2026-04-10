import { Observable } from "rxjs";
import { IOrganization, UpdateOrganizationDto } from "src/app/core/models/Empresas/empresa-config.model";

export interface IOrganizationRepository {
  get(): Observable<IOrganization>;

  // Coincide con: PUT /api/Empresa
  update(config: UpdateOrganizationDto): Observable<IOrganization>;
}
