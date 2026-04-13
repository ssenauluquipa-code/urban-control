// Enum para los estados del Lote según el Swagger
export type TEstadoLote = 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO' | 'BLOQUEADO';

export interface ILote {
    id: string;
    manzanaId: string;
    proyectoId?: string;
    numero: number;
    areaM2: number;
    precioReferencial: number;
    dimensionNorte?: number;
    dimensionSur?: number;
    dimensionEste?: number;
    dimensionOeste?: number;
    comision?: number;
    observaciones?: string;
    estado: TEstadoLote;
    imagenes?: string[];
}

export interface CreateLoteDto {
    manzanaId: string;
    numero: number;
    areaM2: number;
    precioReferencial?: number;
    dimensionNorte?: number;
    dimensionSur?: number;
    dimensionEste?: number;
    dimensionOeste?: number;
    comision?: number;
    observaciones?: string;
}

export type UpdateLoteDto = Partial<CreateLoteDto>;

export interface UpdateEstadoLoteDto {
    estado: TEstadoLote;
}