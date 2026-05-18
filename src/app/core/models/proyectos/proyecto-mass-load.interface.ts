export interface LoteExcepcionMassLoad {
  numero: number;
  areaM2: number;
  precioReferencial: number;
  dimensionNorte: number;
  dimensionSur: number;
  dimensionEste: number;
  dimensionOeste: number;
  comision: number;
  observaciones?: string;
}

export interface ManzanaMassLoad {
  areaM2: number;
  precioReferencial: number;
  dimensionNorte: number;
  dimensionSur: number;
  dimensionEste: number;
  dimensionOeste: number;
  comision: number;
  observaciones?: string;
  codigo: string;
  descripcion?: string;
  cantidadLotes: number;
  excepciones?: LoteExcepcionMassLoad[];
}

export interface ProyectoMassLoadPayload {
  manzanas: ManzanaMassLoad[];
}
