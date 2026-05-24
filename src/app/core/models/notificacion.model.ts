// src/app/core/models/notificacion.model.ts

export type TipoNotificacion =
  | 'CUOTA_POR_VENCER'
  | 'CUOTA_VENCIDA'
  | 'LOTE_LIBERADO_RESERVA_CANCELADA'
  | 'LOTE_LIBERADO_RESERVA_VENCIDA'
  | 'LOTE_LIBERADO_VENTA_ANULADA';

export interface INotificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  destinatarioUserId: string | null;
  fechaLectura: string | null;
  fechaProgramada: string;
  createdAt: string;
  // Relaciones opcionales detalladas en el endpoint GET /{id}
  destinatarioUser?: Record<string, unknown>;
  cuota?: Record<string, unknown>;
  lote?: Record<string, unknown>;
  reserva?: Record<string, unknown>;
  venta?: Record<string, unknown>;
}

export interface INotificacionResumen {
  totalNoLeidas: number;
  cuotasPorVencer: number;
  cuotasVencidas: number;
  lotesLiberados: number;
}

// Filtros opcionales permitidos por el query string
export interface INotificacionFilter {
  leida?: boolean;
  tipo?: TipoNotificacion;
  fechaDesde?: string;
  fechaHasta?: string;
  limit?: number;
}