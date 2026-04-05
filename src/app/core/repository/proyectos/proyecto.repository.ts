import { Observable } from "rxjs";
import { IProyectoRepository } from "../../interfaces/repository/proyectos/proyecto.repository.interface";
import { IProyectoLookup } from "../../models/proyectos/proyecto.model";
import { environment } from "src/environments/environment.prod";
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ProyectoRepository implements IProyectoRepository {

  private readonly API_URL = `${environment.apiUrl}/proyecto`;

  constructor(private http: HttpClient) { }


  getProyectosLookup(): Observable<IProyectoLookup[]> {
    return this.http.get<IProyectoLookup[]>(`${this.API_URL}/lookup`);
  }
}
