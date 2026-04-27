import { EGenero, ETipoDocumento } from "../cliente.model";

export interface IAsesor {
    id: string;
    codigoAsesor: number;
    nombreCompleto: string;
    tipoDocumento: ETipoDocumento;
    nroDocumento: string;
    genero: EGenero;
    fechaNacimiento: string;
    telefono: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAsesorDto {
    nombreCompleto: string;
    tipoDocumento: ETipoDocumento;
    nroDocumento: string;
    genero: EGenero;
    fechaNacimiento: string;
    telefono: string;
    email: string;
}

export type UpdateAsesorDto = Partial<CreateAsesorDto>;

export interface IAsesorOption {
    id: string;
    nombreCompleto: string;
    nroDocumento: string;
}