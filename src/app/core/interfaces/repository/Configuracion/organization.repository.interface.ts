import { Observable } from "rxjs";
import { IOrganization, UpdateOrganizationDto, UploadLogoResponse, DeleteLogoResponse } from "src/app/core/models/Empresas/empresa-config.model";

export interface IOrganizationRepository {
  get(): Observable<IOrganization>;
  update(config: UpdateOrganizationDto): Observable<IOrganization>;
  uploadLogo(data: FormData): Observable<UploadLogoResponse>;
  deleteLogo(): Observable<DeleteLogoResponse>;
}
