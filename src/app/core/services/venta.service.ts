import { Inject, Injectable } from '@angular/core';
import { IVentaRepository } from '../interfaces/repository/venta.repository.interface';
import { CreateVentaDto } from '../models/venta.model';

@Injectable({
    providedIn: 'root'
})
export class VentaService {

    constructor(
    @Inject('IVentaRepository') private repo: IVentaRepository
  ) {}

  listarVentas(manzanaId?: string, term?: string) {
    return this.repo.getAll(manzanaId, term);
  }

  registrarNuevaVenta(venta: CreateVentaDto) {
    // Aquí puedes agregar validaciones de negocio antes de llamar al repo
    return this.repo.create(venta);
  }



}
