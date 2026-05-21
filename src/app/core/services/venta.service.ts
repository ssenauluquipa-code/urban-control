import { Inject, Injectable } from "@angular/core";
import { IVentaRepository } from "../interfaces/repository/venta.repository.interface";
import { CreateVentaDto } from "../models/venta.model";

@Injectable({
  providedIn: "root",
})
export class VentaService {
  constructor(@Inject("IVentaRepository") private repo: IVentaRepository) {}

  registrarNuevaVenta(venta: CreateVentaDto) {
    // Aquí puedes agregar validaciones de negocio antes de llamar al repo
    return this.repo.create(venta);
  }

  listarVentas(manzanaId?: string, term?: string) {
    return this.repo.getAll(manzanaId, term);
  }

  listarVentasActivasPorCliente(clienteId: string) {
    return this.repo.getVentasActivasByCliente(clienteId);
  }

  /**
   * Ventas activas a cuotas con saldo pendiente del cliente (registro de pagos).
   * GET /api/v1/ventas/cliente/:id/pagos
   */
  listarVentasPagoPorCliente(clienteId: string) {
    return this.repo.getVentasPagoPorCliente(clienteId);
  }


  obtenerVentaPorId(id: string) {
    return this.repo.getById(id);
  }

  eliminarVenta(id: string) {
    return this.repo.eliminar(id);
  }

  anularVenta(id: string) {
    return this.repo.anular(id);
  }

  obtenerCuotasPorVenta(id: string) {
    return this.repo.getCuotasByVenta(id);
  }

  obtenerSaldoPorVenta(id: string) {
    return this.repo.getSaldoByVenta(id);
  }

  

  

  
}
