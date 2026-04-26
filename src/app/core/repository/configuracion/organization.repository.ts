import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IOrganization, UpdateOrganizationDto, UploadLogoResponse, DeleteLogoResponse } from "../../models/Empresas/empresa-config.model";
import { environment } from "src/environments/environment.prod";
import { HttpClient } from "@angular/common/http";
import { IOrganizationRepository } from "../../interfaces/repository/Configuracion/organization.repository.interface";

@Injectable({ providedIn: 'root' })
export class OrganizationRepository implements IOrganizationRepository {
  private readonly API_URL = `${environment.apiUrl}/organization`;

  constructor(private http: HttpClient) { }

  get(): Observable<IOrganization> {
    return this.http.get<IOrganization>(this.API_URL);
  }

  update(config: UpdateOrganizationDto): Observable<IOrganization> {
    return this.http.patch<IOrganization>(this.API_URL, config);
  }

  uploadLogo(data: FormData): Observable<UploadLogoResponse> {
    return this.http.post<UploadLogoResponse>(`${this.API_URL}/logo`, data);
  }

  deleteLogo(): Observable<DeleteLogoResponse> {
    return this.http.delete<DeleteLogoResponse>(`${this.API_URL}/logo`);
  }
}
