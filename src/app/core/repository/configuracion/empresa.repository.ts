import { Injectable } from "@angular/core";
import { IEmpresaRepository } from "../../interfaces/repository/Configuracion/empresa.repository.interface";
import { Observable } from "rxjs";
import { IEmpresaConfig } from "../../models/Empresas/empresa-config.model";
import { environment } from "src/environments/environment.prod";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class EmpresaRepository implements IEmpresaRepository{
  private readonly API_URL = `${environment.apiUrl}/Empresa`;

  constructor(private http: HttpClient) {}

  get(): Observable<IEmpresaConfig> {
    return this.http.get<IEmpresaConfig>(`${this.API_URL}`);
  }
  update(config: IEmpresaConfig): Observable<any> {
    return this.http.put(`${this.API_URL}`, config);
  }

}
