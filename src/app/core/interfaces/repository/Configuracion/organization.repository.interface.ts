import { Observable } from "rxjs";
import { IOrganization, UpdateOrganizationDto } from "src/app/core/models/Empresas/empresa-config.model";

export interface IOrganizationRepository {
  get(): Observable<IOrganization>;
  update(config: UpdateOrganizationDto): Observable<IOrganization>;
}
