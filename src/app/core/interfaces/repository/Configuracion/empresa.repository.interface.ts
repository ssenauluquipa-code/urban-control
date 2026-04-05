import { Observable } from "rxjs";
import { IEmpresaConfig } from "src/app/core/models/Empresas/empresa-config.model";

export interface IEmpresaRepository {
  get(): Observable<IEmpresaConfig>;

  // Coincide con: PUT /api/Empresa
  update(config: IEmpresaConfig): Observable<any>;
}
