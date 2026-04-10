import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { IOrganization, UpdateOrganizationDto } from "../../models/Empresas/empresa-config.model";
import { environment } from "src/environments/environment.prod";
import { HttpClient } from "@angular/common/http";
import { IOrganizationRepository } from "../../interfaces/repository/Configuracion/organization.repository.interface";

@Injectable({ providedIn: 'root' })
export class OrganizationRepository implements IOrganizationRepository {
  private readonly API_URL = `${environment.apiUrl}/organization`;

  // 🚩 CAMBIA ESTO A 'false' CUANDO EL BACKEND ESTÉ LISTO
  private readonly useMock = true;

  // Datos locales idénticos a los de tu Swagger
  private readonly mockData: IOrganization = {
    id: "16d67fed-27c8-47dc-b03c-0cb3086084d8",
    name: "UrbanControl (Local Mock)",
    subdomain: "urbancontrol",
    email: "admin@urbancontrol.local",
    address: "Av. 3er Anillo interno e/ Av. Banzer #44 - Santa Cruz Bolivia",
    phone: "+591 64584633",
    currency: "BOB",
    timezone: "America/La_Paz",
    isActive: true,
    createdAt: "2026-04-09T23:14:25.553Z",
    updatedAt: "2026-04-09T23:24:39.452Z"
  };

  constructor(private http: HttpClient) { }

  get(): Observable<IOrganization> {
    if(this.useMock) {
      console.warn("⚠️ Usando datos locales para Organization");
      return of(this.mockData);
    }
    return this.http.get<IOrganization>(this.API_URL);
  }
  update(config: UpdateOrganizationDto): Observable<IOrganization> {
    if (this.useMock) {
      console.warn("⚠️ Simulando actualización local");
      // Simulamos que la actualización fue exitosa devolviendo los mismos datos
      return of({ ...this.mockData, ...config });
    }
    return this.http.patch<IOrganization>(this.API_URL, config);
  }

}
