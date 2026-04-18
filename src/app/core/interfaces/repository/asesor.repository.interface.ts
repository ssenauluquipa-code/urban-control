import { Observable } from "rxjs";
import { CreateAsesorDto, IAsesor, UpdateAsesorDto } from "../../models/asesor/asesor.model";

export interface IAsesorRepository {
    /**
     * Obtiene la lista de asesores.
     * Nota: A diferencia de Clientes, este endpoint devuelve un Array simple, no está paginado.
     */
    getAll(term?: string, nroDocumento?: string, isActive?: boolean): Observable<IAsesor[]>;

    getById(id: string): Observable<IAsesor>;

    create(dto: CreateAsesorDto): Observable<IAsesor>;

    update(id: string, dto: UpdateAsesorDto): Observable<IAsesor>;

    delete(id: string): Observable<void>;

    activate(id: string): Observable<IAsesor>;
}