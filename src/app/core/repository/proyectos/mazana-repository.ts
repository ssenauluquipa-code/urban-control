import { HttpClient } from "@angular/common/http";
import { IManzanaRepository } from "../../interfaces/repository/proyectos/manzana-repository.interface";
import { environment } from "src/environments/environment.prod";
import { IManzana, IManzanaCreateDto, IManzanaUpdateDto } from "../../models/proyectos/manzana.model";
import { Observable } from "rxjs";

export class MazanaRepository implements IManzanaRepository {

  private readonly URL = `${environment.apiUrl}/Manzana`;
  constructor(private http: HttpClient){}

  getByProyecto(proyectoId: string): Observable<IManzana[]> {
    return this.http.get<IManzana[]>(`${this.URL}/proyecto/${proyectoId}`);
  }

  getById(id: string): Observable<IManzana> {
    return this.http.get<IManzana>(`${this.URL}/${id}`);
  }

  create(dto: IManzanaCreateDto): Observable<IManzana> {
    return this.http.post<IManzana>(this.URL, dto);
  }

  update(id: string, dto: IManzanaUpdateDto): Observable<void> {
    return this.http.put<void>(`${this.URL}/${id}`, dto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }
}
