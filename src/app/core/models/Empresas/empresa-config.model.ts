
export interface IOrganization {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  address: string;
  phone: string;
  currency: string;
  timezone: string;
  diasVencimientoReserva: number;
  plazoMaximoMeses: number;
  horaCronDiario: number;
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
  diasVencimientoReserva?: number;
  plazoMaximoMeses?: number;
  horaCronDiario?: number;
}
