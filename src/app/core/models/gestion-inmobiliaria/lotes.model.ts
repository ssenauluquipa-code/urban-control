export type TLoteEstado = 'Disponible' | 'Vendido' | 'Reservado' | 'Bloqueado';

export interface ILote {
  id: string; // Es un GUID
  numeroLote: string;
  manzana: string; // Es una letra/string "G"
  superficieM2: number; // Cambio de nombre
  estado: TLoteEstado;
  proyectoId: string;
  proyecto: {
    nombre: string;
    precioBaseM2: number;
  };
}

export interface ICreateLoteDto {
  numeroLote: string;
  manzanaId: number;
  proyectoId: number;
  areaM2: number;
  precio: number;
}

export interface IUpdateLoteEstadoDto {
  estado: TLoteEstado;
}
