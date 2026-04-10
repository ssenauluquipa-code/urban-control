export interface IEmpresaConfig {
    id?: string;
    nombreComercial: string;
    razonSocial: string;
    nit: string;
    direccion: string;
    telefono: string;
    email: string;
    diasReservaVencimiento: number;
    monedaSimbolo: string;
    fechaActualizacion?: Date;
}


export interface IOrganization {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  address: string;
  phone: string;
  currency: string;
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  currency?: string;
  timezone?: string;
}