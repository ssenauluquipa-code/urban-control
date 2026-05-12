import { Inject, Injectable } from "@angular/core";
import { IVentaRepository } from "../interfaces/repository/venta.repository.interface";
import { CreateVentaDto } from "../models/venta.model";

@Injectable({
  providedIn: "root",
})
export class VentaService {
  constructor(@Inject("IVentaRepository") private repo: IVentaRepository) {}

  listarVentas(manzanaId?: string, term?: string) {
    return this.repo.getAll(manzanaId, term);
  }

  obtenerVentaPorId(id: string) {
    return this.repo.getById(id);
  }

  listarVentasActivasPorCliente(clienteId: string) {
    return this.repo.getVentasActivasByCliente(clienteId);
  }

  obtenerCuotasPorVenta(id: string) {
    return this.repo.getCuotasByVenta(id);
  }

  obtenerSaldoPorVenta(id: string) {
    return this.repo.getSaldoByVenta(id);
  }

  registrarNuevaVenta(venta: CreateVentaDto) {
    // Aquí puedes agregar validaciones de negocio antes de llamar al repo
    return this.repo.create(venta);
  }

  anularVenta(id: string) {
    return this.repo.anular(id);
  }
}
