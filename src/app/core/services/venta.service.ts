import { Inject, Injectable } from "@angular/core";
import {
  IVentaRepository,
} from "../interfaces/repository/venta.repository.interface";
import { CreateVentaDto, IContratoVenta } from "../models/venta.model";
import { Observable } from "rxjs";

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

  /**
   * Solicita el PDF de Plan de Cuentas para verificar cuotas pagadas, pendientes o vencidas.
   */
  public descargarPlanCuentas(ventaId: string, clienteId: string): Observable<Blob> {
    // Aquí puedes meter reglas de negocio adicionales si tu arquitectura lo requiere antes de ir al repo
    return this.repo.getPlanCuentasPdf(ventaId, clienteId);
  }

  /**
   * Solicita el PDF de informe de devolución total de dinero para ventas anuladas.
   */
  public descargarInformeDevolucion(ventaId: string, clienteId: string): Observable<Blob> {
    return this.repo.getInformeDevolucionPdf(ventaId, clienteId);
  }

  subirContratos(ventaId: string, archivos: File[]): Observable<any> {
    return this.repo.subirContratos(ventaId, archivos);
  }

  listarContratos(ventaId: string): Observable<IContratoVenta[]> {
    return this.repo.listarContratos(ventaId);
  }

  eliminarContratos(ventaId: string, contratoIds: string[]): Observable<void> {
    return this.repo.eliminarContratos(ventaId, contratoIds);
  }
}
