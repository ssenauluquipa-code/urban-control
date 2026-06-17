import { ICliente } from "./cliente.model";
import { ILote } from "./lote/lote.model";

export enum EstadoReserva {
    ACTIVA = 'ACTIVA',
    VENCIDA = 'VENCIDA',
    CONVERTIDA = 'CONVERTIDA', // Nuevo estado
    CANCELADA = 'CANCELADA'
}
export enum Moneda {
    BS = 'BS',
    USD = 'USD'
}

export interface IReserva {
    id?: string;
    reservaId?: string;
    codigoReserva: number;
    clienteId: string;
    loteId: string;
    montoReserva: number;
    moneda: Moneda;
    tipoCambio?: number;
    fechaReserva: string;
    fechaVencimiento: string;
    estado: EstadoReserva;
    observaciones?: string;
    createdAt: string;
    updatedAt: string;

    // Campos planos (Lista)
    nombreCliente?: string;
    nroDocumento?: string;
    nroContacto?: string;
    numeroLote?: number;
    manzana?: string;
    precioLote?: number;
    areaLote?: number;

    // Objetos anidados (Detalle)
    cliente?: ICliente;
    lote?: ILote;
    asesorId: string;
    nombreAsesor?: string;
}

export interface CreateReservaDto {
    clienteId: string;
    loteId: string;
    montoReserva: number;
    tipoCambio: number;
    moneda: Moneda;
    fechaVencimiento: string;
    observaciones?: string;
}

// 👇 Nuevas interfaces para respuestas tipadas
export interface ICreateReservaResponse {
    success: boolean;
    message: string;
    data: {
        reservaId: string;
        codigoReserva: number;
        montoReserva: number;
        moneda: Moneda;
        fechaReserva: string;
        fechaVencimiento: string;
        estado: EstadoReserva;
        observaciones: string;
        createdAt: string;
        updatedAt: string;
    };
}

export interface ICancelReservaResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
    };
}

export interface IUpdateReserva{
    montoReserva: number
    tipoCambio: number
    moneda: string
    fechaVencimiento: string
    observaciones: string
}