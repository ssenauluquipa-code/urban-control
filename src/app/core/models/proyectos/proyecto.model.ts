export interface IProyecto {
  id: string;
  nombre: string;
  descripcion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  estado: string; // Ej: 'ACTIVO'
  createdAt: string;
  updatedAt: string;
}

export interface CreateProyectoDto {
  nombre: string;
  departamento: string;
  provincia?: string;
  distrito?: string;
  direccion: string;
  descripcion?: string;
}

export type UpdateProyectoDto = Partial<CreateProyectoDto>;

export interface IProyectoActivo {
  id: string;
  nombre: string;
  cantidadManzanas: number;
  cantidadLotes: number;
}