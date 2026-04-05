import { Injectable } from '@angular/core';
import { EmpresaRepository } from '../../repository/configuracion/empresa.repository';
import { IEmpresaConfig } from '../../models/Empresas/empresa-config.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

constructor(private repository: EmpresaRepository) { }
getEmpresa(): Observable<IEmpresaConfig> {
    return this.repository.get();
  }

  updateEmpresa(config: IEmpresaConfig): Observable<any> {
    // Aquí podrías añadir lógica: ej. verificar si el usuario tiene permiso Admin
    return this.repository.update(config);
  }
}
