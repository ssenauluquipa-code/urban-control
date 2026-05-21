
export interface IOrganization {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  address: string;
  phone: string;
  logoUrl: string;
  currency: string;
  tipoDeCambio: number;
  diasVencimientoReserva: number;
  plazoMaximoMeses: number;
  horaCronDiario: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  asesores: IOrganizationAsesor[];
}

export interface IOrganizationAsesor {
  id: string;
  codigoAsesor: number;
  nombreCompleto: string;
  tipo: string;
  tipoDocumento: string;
  nroDocumento: string;
  complemento: string;
  telefono: string;
  email: string;
  isActive: boolean;
}

export interface UpdateOrganizationDto {
  name?: string;
  email?: string;
  address?: string;
  phone?: string;
  currency?: string;
  tipoDeCambio?: number;
  diasVencimientoReserva?: number;
  plazoMaximoMeses?: number;
  horaCronDiario?: number;
}

export interface UploadLogoResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    logoUrl: string;
  };
}

export interface DeleteLogoResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    logoUrl: null;
  };
}
