// src/app/core/models/actividades/actividades.model.ts

export type ActividadTipo = 'VENTA' | 'PAGO' | 'RESERVA' | 'LOTE';
export type ActividadAccion = 'CREADA' | 'ACTUALIZADA' | 'ANULADA' | 'REGISTRADO' | 'CANCELADA';

export interface IActividadUsuario {
  id: string;
  nombre: string;
}

export interface IActividadEntidad {
  tipo: ActividadTipo;
  id: string;
}

export interface IActividad {
  id: string;
  tipo: ActividadTipo;
  accion: ActividadAccion;
  titulo: string;
  descripcion: string; // El backend envía string plano o estructurado convertible
  fecha: string;       // Formato ISO string para manejo de tiempo relativo
  usuario: IActividadUsuario; // El PDF V2 aclara que viene mapeado directamente
  entidad: IActividadEntidad;
  metadata: Record<string, unknown>; // Tipado estricto seguro para objetos dinámicos
}

// Representa la respuesta directa envuelta por el backend
export interface IActividadesResponse {
  historial: IActividad[];
}

// DTO para manejar los Query Params del backend con tipado estricto
export interface IActividadesFiltrosDto {
  tipo?: ActividadTipo | '';
  accion?: ActividadAccion | '';
  fechaDesde?: string;
  fechaHasta?: string;
  limit?: number;
}