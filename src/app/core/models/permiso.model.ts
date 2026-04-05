export interface IPermisoMatriz {
  moduloId: number;
  moduloNombre: string;
  submodulos: ISubmoduloPermiso[];
  icono:string;
}

export interface ISubmoduloPermiso {
  submoduloId: number;
  nombre: string;
  acciones: IAccionPermiso[];
}

export interface IAccionPermiso {
  capacidadId: number;
  nombrePermiso: string;
  slug: string;
  concedido: boolean;
  esHabilitado: boolean;
}

export interface IPermisoUpdate {
  rolId: number;
  capacidadId: number;
  concedido: boolean;
}
