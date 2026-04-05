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
