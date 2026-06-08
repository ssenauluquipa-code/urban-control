export type EstadoLote = 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'ANULADO';

// Parámetros de consulta (Queries / Filtros)
export interface ILoteReporteQuery {
  manzanaId?: string;
  estado?: EstadoLote;
}

export interface IPeriodoReporteQuery {
  fechaInicio?: string; // Formato YYYY-MM-DD
  fechaFin?: string;    // Formato YYYY-MM-DD
}

// 1. DTO Lotes
export interface ILoteReporte {
  proyecto: string;
  manzana: string;
  lote: number;
  loteId: string;
  estado: EstadoLote;
  registradoPor: string | null;
  areaM2: number;
  precioReferencial: number;
  comision: number | null;
  observaciones: string | null;
}

// 2. DTO Clientes
export interface IClienteReporte {
  clienteId: string;
  nombreCompleto: string;
  documento: string;
  telefono: string | null;
  email: string | null;
  cantidadLotesPrecomprados: number;
  fechaRegistro: string;
}

// 3. DTO Ventas / Contratos
export interface IVentaReporte {
  contratoId: string;
  cliente: string;
  manzana: string;
  lote: number;
  precioVenta: number;
  cuotaInicial: number;
  saldoFinanciado: number;
  fechaContrato: string;
}

// 4. DTO Pagos y Recaudaciones
export interface IPagoReporte {
  pagoId: string;
  cliente: string;
  concepto: string;
  monto: number;
  fechaPago: string;
  estado: EstadoPago;
  metodoPago: string;
}

// 5. DTO Estado Financiero / Saldos de Clientes
export interface IEstadoFinancieroReporte {
  clienteId: string;
  cliente: string;
  totalContratado: number;
  totalPagado: number;
  saldoPendiente: number;
  cuotasAtrasadas: number;
}

// 6. DTO Comisiones de Asesores
export interface IComisionReporte {
  asesorId: string;
  nombreAsesor: string;
  totalVentasAsignadas: number;
  montoTotalVendido: number;
  comisionAcumulada: number;
  comisionPagada: number;
}

// 7. DTO Ocupación / Disponibilidad (Métricas avanzadas de Manzanas)
export interface IOcupacionManzanaReporte {
  manzanaId: string;
  nombreManzana: string;
  totalLotes: number;
  lotesDisponibles: number;
  lotesReservados: number;
  lotesVendidos: number;
  porcentajeOcupacion: number;
}

// 8. DTO Auditoría / Logs de Movimientos Urbanos
export interface IAuditoriaReporte {
  logId: string;
  usuario: string;
  accion: string;
  entidad: string;
  detalles: string;
  fechaRegistro: string;
}