import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment.prod";
import { IPermisoMatriz, IPermisoUpdate } from "../models/permiso.model";

@Injectable({
  providedIn: 'root'
})
export class PermisosRepository {

 private readonly apiUrl = `${environment.apiUrl}/Permisos`;

  constructor(private http: HttpClient) {}

  // Obtiene la matriz completa para un rol
  getMatrizPorRol(rolId: number): Observable<IPermisoMatriz[]> {
    return this.http.get<IPermisoMatriz[]>(`${this.apiUrl}/matriz/${rolId}`);
  }

  // Envía la lista de cambios al backend
  actualizarPermisos(payload: IPermisoUpdate[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/guardar`, payload);
  }

}
