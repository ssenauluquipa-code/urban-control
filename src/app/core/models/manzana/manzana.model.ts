import { ILote } from "../lote/lote.model";


export interface IManzana {
    id: string;
    proyectoId: string;
    codigo: string; // Ej: "A", "B", "1"
    descripcion?: string;
    // El backend podría devolver lotes aquí si es el endpoint detallado
    lotes?: ILote[];
}

export interface CreateManzanaDto {
    proyectoId: string;
    codigo: string;
    descripcion?: string;
}

export type UpdateManzanaDto = Partial<CreateManzanaDto>;