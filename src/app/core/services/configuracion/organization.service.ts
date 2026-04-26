import { Inject, Injectable } from '@angular/core';
import { IOrganization, UpdateOrganizationDto, UploadLogoResponse, DeleteLogoResponse } from '../../models/Empresas/empresa-config.model';
import { Observable, shareReplay, tap } from 'rxjs';
import { IOrganizationRepository } from '../../interfaces/repository/Configuracion/organization.repository.interface';

export const ORGANIZATION_REPOSITORY_TOKEN = 'IOrganizationRepository';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private empresaCache$: Observable<IOrganization> | null = null;

  constructor(
    @Inject(ORGANIZATION_REPOSITORY_TOKEN) private repository: IOrganizationRepository
  ) { }

  getEmpresa(): Observable<IOrganization> {
    if (!this.empresaCache$) {
      this.empresaCache$ = this.repository.get().pipe(shareReplay(1));
    }
    return this.empresaCache$;
  }

  updateEmpresa(config: UpdateOrganizationDto): Observable<IOrganization> {
    return this.repository.update(config).pipe(
      tap(() => this.clearCache())
    );
  }

  uploadLogo(file: File): Observable<UploadLogoResponse> {
    const formData = new FormData();
    formData.append('logo', file);
    return this.repository.uploadLogo(formData).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteLogo(): Observable<DeleteLogoResponse> {
    return this.repository.deleteLogo().pipe(
      tap(() => this.clearCache())
    );
  }

  clearCache(): void {
    this.empresaCache$ = null;
  }
}
