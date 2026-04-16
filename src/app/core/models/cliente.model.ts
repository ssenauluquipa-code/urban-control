export enum ETipoDocumento {
    CI = "CI",
    NIT = "NIT",
    PASAPORTE = "PASAPORTE",
    EXTRANJERIA = "EXTRANJERIA"
}
export enum EGenero {
    MASCULINO = "MASCULINO",
    FEMENINO = "FEMENINO",
    OTRO = "OTRO"
}
export interface ICliente {
    id: string;
    codigoCliente: number;
    nombreCompleto: string;
    tipoDocumento: ETipoDocumento; // Uso del Enum
    nroDocumento: string;
    complemento?: string;
    numeroReferencia?: string;
    genero: EGenero; // Uso del Enum
    fechaNacimiento?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClienteDto {
    nombreCompleto: string;
    tipoDocumento: ETipoDocumento;
    nroDocumento: string;
    complemento?: string;
    numeroReferencia?: string;
    genero: EGenero;
    fechaNacimiento?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
}

export type UpdateClienteDto = Partial<CreateClienteDto>;

// Interfaz para la respuesta paginada del backend
export interface IPagedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}