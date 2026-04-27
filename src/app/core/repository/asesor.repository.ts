import { environment } from "src/environments/environment";
import { IAsesorRepository } from "../interfaces/repository/asesor.repository.interface";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { CreateAsesorDto, IAsesor, IAsesorOption, UpdateAsesorDto } from "../models/asesor/asesor.model";
import { Injectable } from "@angular/core";
@Injectable({
    providedIn: 'root'
})
export class AsesorRepository implements IAsesorRepository {

    private readonly Api_Url = `${environment.apiUrl}/asesores`;

    constructor(private http: HttpClient) { }

    // GET /asesores (Lista simple con filtros opcionales)
    getAll(term?: string, nroDocumento?: string, isActive?: boolean): Observable<IAsesor[]> {
        let params = new HttpParams();

        if (term) params = params.set('term', term);
        if (nroDocumento) params = params.set('nroDocumento', nroDocumento);
        if (isActive !== undefined) params = params.set('isActive', isActive.toString());

        return this.http.get<IAsesor[]>(this.Api_Url, { params });
    }

    getById(id: string): Observable<IAsesor> {
        return this.http.get<IAsesor>(`${this.Api_Url}/${id}`);
    }

    create(dto: CreateAsesorDto): Observable<IAsesor> {
        return this.http.post<IAsesor>(this.Api_Url, dto);
    }

    update(id: string, dto: UpdateAsesorDto): Observable<IAsesor> {
        return this.http.patch<IAsesor>(`${this.Api_Url}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.Api_Url}/${id}`);
    }

    activate(id: string): Observable<IAsesor> {
        return this.http.patch<IAsesor>(`${this.Api_Url}/${id}/activate`, {});
    }

    searchAsesores(term: string): Observable<IAsesorOption[]> {
        let params = new HttpParams();
        if (term && term.trim() !== '') {
            params = params.set('term', term);
        }
        return this.http.get<IAsesorOption[]>(`${this.Api_Url}/search`, { params });
    }

}
