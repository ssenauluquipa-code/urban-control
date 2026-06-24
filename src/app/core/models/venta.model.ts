import { Moneda } from "./reserva.model";

export interface CreateVentaPropietarioDto {
  clienteId: string;
  rol: RolPropietario; // Tipado fuerte
}

export interface CreateVentaDto {
  loteId: string;
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
  tipoCambio: number;
  moneda: Moneda;
  observaciones?: string;
  propietarios: CreateVentaPropietarioDto[]; // Array tipado de 1 a 3 items
}

export enum TipoPago {
  CONTADO = "CONTADO",
  CUOTAS = "CUOTAS",
}

export enum EstadoVenta{
  ACTIVA = "ACTIVA",
  ANULADA = "ANULADA"
}

export enum FrecuenciaPago {
  SEMANAL = "SEMANAL",
  QUINCENAL = "QUINCENAL",
  MENSUAL = "MENSUAL",
  BIMESTRAL = "BIMESTRAL",
  TRIMESTRAL = "TRIMESTRAL",
}

export enum RolPropietario {
  TITULAR = "TITULAR",
  COTITULAR = "COTITULAR",
}

export interface IVenta {
  ventaId: string;
  nroVenta: number;
  estado: string;
  reservaId?: string;
  codReserva?: number;
  fechaVenta: string;
  tipoPago: TipoPago;
  frecuenciaPago?: FrecuenciaPago;
  montoTotal: number;
  cuotaInicial?: number;
  saldoPendiente: number;
  tipoCambio:number;
  moneda: string;
  createdAt?: string;
  loteId?: string;
  manzana: string;
  numeroLote: number;
  clientes: ClienteVenta[];
  asesorId?: string;
  nombreAsesor: string;
  nroDocumentoAsesor?: string;
}

export interface IVentaActivaCliente {
  ventaId: string;
  nroVenta: number;
  tipoPago: TipoPago;
  frecuenciaPago?: FrecuenciaPago;
  saldoPendiente: number;
  lote: string;
}

export interface IVentaDetalle {
  ventaId: string;
  nroVenta: number;
  estado: string;
  fechaVenta: string;
  reservaId?: string;
  codReserva?: number;
  tipoPago: TipoPago;
  frecuenciaPago?: FrecuenciaPago;
  fechaPagoInicial?: string;
  nroCuotas?: number;
  modalidadCalendarioPago?: string;
  diaSemanaPago?: string;
  diaPagoMes1?: number;
  diaPagoMes2?: number;
  montoTotal: number;
  cuotaInicial: number;
  saldoPendiente: number;
  moneda: Moneda;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  loteId: string;
  numeroLote: number;
  estadoLote?: string;
  areaM2?: number;
  precioReferencial?: number;
  manzanaId?: string;
  manzana: string;
  clientes: ClienteVenta[];
  asesorId?: string;
  nombreAsesor?: string;
  nroDocumentoAsesor?: string;
}

export interface IVentaSaldoResumen {
  ventaId: string;
  nroVenta: number;
  montoTotal: string;
  cuotaInicial: string;
  totalPagado: string;
  saldoPendiente: string;
}

export interface ClienteVenta {
  id: string;
  nombre: string;
  rol?: RolPropietario;
}

/**
 * Tipo unión para el evento de salida, asegurando que no haya ambigüedad
 */
export type SelectClienteOutput =
  | string
  | string[]
  | CreateVentaPropietarioDto[]
  | null;

export enum DiaSemanaPago {
  LUNES = "LUNES",
  MARTES = "MARTES",
  MIERCOLES = "MIERCOLES",
  JUEVES = "JUEVES",
  VIERNES = "VIERNES",
  SABADO = "SABADO",
  DOMINGO = "DOMINGO",
}

export interface IVentaCuota {
  id: string;
  nroCuota: number;
  fechaVencimiento: string;
  monto: number;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

/** Venta activa a cuotas con saldo pendiente, para registrar pagos de un cliente. */
export interface IClientePagoById {
  nombreCompletoCliente: string;
  nroDocumentoCliente: string | number;
  ventaId: string;
  nroVenta: number;
  fechaVenta: string;
  frecuenciaPago: string;
  moneda: string;
  tipoCambio: number;
  montoTotal: number;
  totalPagado: number;
  saldoPendiente: number;
  nroCuotas: number;
  montoCuota: number;
  /** Campo enriquecido desde /activas (ej: "Lote A-13"). Opcional porque /pagos no lo devuelve. */
  lote?: string;
}

export interface IContratoVenta {
  id: string;
  publicUrl: string;
  mimeType: string;
  originalName: string;
  sizeBytes: number;
}

