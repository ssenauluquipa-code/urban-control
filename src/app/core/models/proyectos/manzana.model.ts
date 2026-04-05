export interface IManzana {
  id: string;
  codigoManzana: string;
  geometria?: string;
  proyectoId: string;
}

export interface IManzanaCreateDto {
  codigoManzana: string;
  proyectoId: string;
}

export interface IManzanaUpdateDto {
  codigoManzana?: string;
  geometria?: string;
}
