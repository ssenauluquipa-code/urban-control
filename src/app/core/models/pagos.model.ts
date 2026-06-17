import { Moneda } from "./reserva.model";

export enum EMetodoPago {
  EFECTIVO = 'EFECTIVO',
  CHEQUE = 'CHEQUE',
  TARJETA = 'TARJETA',
  QR = 'QR',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export interface IPagosDto {
  ventaId: string;
  monto: number;
  monedaRecibida: Moneda;
  metodo: EMetodoPago;
  fechaPago: Date | string;
  observaciones?: string;
  comprobantes?: string[];
}

export interface AnuladoPorUser {
  id: string;
  name: string;
  email: string;
}

export interface IPagos {
  pagoId: string;
  codigoPago: number;
  ventaId: string;
  estado: string;
  fechaPago: string;
  monto: number;
  montoRecibido: number;
  monedaRecibida: Moneda;
  tipoCambio: number;
  metodo: EMetodoPago;
  observaciones?: string;
  fechaAnulacion?: string | null;
  motivoAnulacion?: string | null;
  anuladoPorUser?: AnuladoPorUser | null;
  cantidadComprobantes: number;
  asesorId: string;
  nombreAsesor?: string;
}

export interface IPagoComprobante {
  id: string;
  publicUrl: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
  orden: number;
  createdAt: string;
}

export interface IPagoAplicacion {
  aplicacionId: string;
  cuotaId: string;
  nroCuota: number;
  fechaVencimiento: string;
  montoCuota: number;
  montoPagadoCuota: number;
  saldoPendienteCuota: number;
  estadoCuota: string;
  montoAplicado: number;
  createdAt: string;
}

export interface IPagoDetalle extends IPagos {
  createdAt: string;
  updatedAt: string;
  comprobantes: IPagoComprobante[];
  aplicaciones: IPagoAplicacion[];
}

export interface IPagosQueryFilters {
  ventaId?: string;
  metodo?: EMetodoPago | string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export enum EstadoPago{
  ACTIVO = "ACTIVO",
  ANULADO = "ANULADO"
}