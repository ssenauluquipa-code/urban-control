import { EMetodoPago, EstadoPago } from "../pagos.model";

export type EstadoLote = 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO' | 'BLOQUEADO';

// Parámetros de consulta (Queries / Filtros)
export interface ILoteReporteQuery {
  manzanaId?: string;
  estado?: EstadoLote;
}

export interface IPeriodoReporteQuery {
  fechaDesde?: string; // Formato ISO / YYYY-MM-DD
  fechaHasta?: string;
}

export interface ITermPeriodoReporteQuery extends IPeriodoReporteQuery {
  term?: string;
}

export interface ICuotasPendientesQuery {
  vencimientoDesde?: string;
  vencimientoHasta?: string;
  term?: string;
}

// 1. DTO Lotes
export interface ILoteReporte {
  proyecto: string;
  manzana: string;
  lote: number;
  loteId: string;
  estado: EstadoLote;
  registradoPor: string;
  areaM2: number;
  dimensionNorte: number;
  dimensionSur: number;
  dimensionEste: number;
  dimensionOeste: number;
  precioReferencial: number;
  comision: number;
  observaciones: string;
}

// 2. DTO Clientes
export interface IClienteReporte {
  id: string;
  nombreCompleto: string;
  tipoDocumento: string;
  nroDocumento: string;
  complemento: string;
  numeroReferencia: string;
  genero: string;
  fechaNacimiento: string;
  estadoCivil: string;
  ocupacion: string;
  telefono: string;
  email: string;
  direccion: string;
  fechaRegistro: string;
  registradoPor: string;
}

// 3. DTO Reservas (¡Actualizado según Swagger!)
export interface IReservaReporte {
  id: string;
  codigoReserva: number;
  cliente: string;
  lote: number;
  manzana: string;
  monto: number;
  moneda: string;
  fechaReserva: string;
  vencimiento: string;
  estado: string;
  registradoPor: string;
}

// 4. DTO Ventas (¡Actualizado según Swagger!)
export interface IVentaReporte {
  id: string;
  nroVenta: number;
  fecha: string;
  clienteTitular: string;
  lote: number;
  manzana: string;
  tipoPago: string;
  frecuenciaPago: string;
  nroCuotas: number;
  montoTotal: number;
  cuotaInicial: number;
  saldoPendiente: number;
  moneda: string;
  estado: string;
  observaciones: string;
  registradoPor: string;
}

// 5. DTO Pagos (¡Actualizado según Swagger!)
export interface IPagoReporte {
  id: string;
  codigoPago: number;
  fecha: string;
  venta: number;
  cliente: string;
  lote: number;
  manzana: string;
  montoAplicado: number;
  monedaVenta: string;
  montoRecibido: number;
  monedaRecibida: string;
  tipoCambio: number; // Mapeado de tipoCambio si es necesario
  metodo: EMetodoPago;
  estado: EstadoPago;
  registradoPor: string;
}

// 6. DTO Cuotas Pendientes (¡Nuevo según Swagger!)
export interface ICuotaPendienteReporte {
  ventaId: string;
  venta: number;
  cliente: string;
  lote: number;
  nroCuota: number;
  vencimiento: string;
  monto: number;
  pagado: number;
  saldo: number;
  moneda: string;
  estado: string;
}

// 7. DTO Clientes en Mora (¡Nuevo según Swagger!)
export interface IClienteMoraReporte {
  id: string;
  cliente: string;
  telefono: number;
  venta: number;
  manzana: string;
  lote: number;
  cuotasVencidas: number;
  montoVencido: number;
  diasAtraso: number;
  saldoTotalVenta: number;
  moneda: string;
}

// 8. DTO Ventas por Asesor (¡Nuevo según Swagger!)
export interface IVentasAsesorReporte {
  id: string;
  asesor: string;
  nroDocumento: string;
  tipo: string;
  genero: string;
  telefono: string;
  cantidadVentas: number;
  montoVendido: number;
  cobrado: number;
  saldoPendiente: number;
}