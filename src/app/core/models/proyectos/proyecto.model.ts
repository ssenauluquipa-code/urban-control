
export interface IProyecto {
   id: string;
  nombre: string;
  ubicacion?: string;
  precioBaseM2: number;
  urlImagenPlano?: string;
  configMapa?: string;
}
export interface IProyectoCreateDto {
  nombre: string;
  ubicacion?: string;
  precioBaseM2: number;
}
export interface IProyectoLookup {
    id: string;
    name: string;
}
