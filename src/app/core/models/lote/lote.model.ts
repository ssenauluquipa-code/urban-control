// Enum para los estados del Lote según el Swagger
export enum TEstadoLote {
    DISPONIBLE = 'DISPONIBLE',
    RESERVADO = 'RESERVADO',
    VENDIDO = 'VENDIDO',
    BLOQUEADO = 'BLOQUEADO'
}

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
    manzana: IManzanaInLote;
    imagenes?: ILoteImagen[];
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
export interface ILoteImagen {
    id: string;
    publicUrl: string;
    mimeType: string;
    orden: number;
}

export interface IProyectoInLote {
    id: string;
    nombre: string;
}

export interface IManzanaInLote {
    id: string;
    codigo: string;
    proyecto: IProyectoInLote;
}

export interface ILoteSearchResult {
    id: string;
    numero: number;
}