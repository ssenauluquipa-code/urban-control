import { Moneda } from "./reserva.model";

export interface CreateVentaPropietarioDto {
  clienteId: string;
  rol: RolPropietario; // Tipado fuerte
}

export interface CreateVentaDto {
  loteId: string;
  asesorId?: string;
  reservaId?: string;
  tipoPago: TipoPago;
  frecuenciaPago?: FrecuenciaPago;
  modalidadCalendarioPago?: string; // Podrías crear otro Enum para esto
  diaSemanaPago?: string;
  diaPagoMes1?: number;
  diaPagoMes2?: number;
  fechaVenta: Date | string;
  fechaPagoInicial?: Date | string;
  nroCuotas?: number;
  montoTotal: number;
  cuotaInicial: number;
  moneda: Moneda;
  observaciones?: string;
  propietarios: CreateVentaPropietarioDto[]; // Array tipado de 1 a 3 items
}

export enum TipoPago {
  CONTADO = 'CONTADO',
  CUOTAS = 'CUOTAS'
}

export enum FrecuenciaPago {
  SEMANAL = 'SEMANAL',
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
  BIMESTRAL = 'BIMESTRAL',
  TRIMESTRAL = 'TRIMESTRAL'
}

export enum RolPropietario {
  TITULAR = 'TITULAR',
  COTITULAR = 'COTITULAR'
}


export interface IVenta {
  ventaId: string;
  nroVenta: number;
  fechaVenta: string;
  tipoPago: TipoPago;
  montoTotal: number;
  saldoPendiente: number;
  moneda: string;
  manzana: string;
  numeroLote: number;
  clientes: ClienteVenta[];
  nombreAsesor: string;
}

export interface ClienteVenta {
  id: string;
  nombre: string;
}

/**
 * Tipo unión para el evento de salida, asegurando que no haya ambigüedad
 */
export type SelectClienteOutput = string | string[] | CreateVentaPropietarioDto[] | null;
