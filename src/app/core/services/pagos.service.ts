import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IPagosRepository } from "../interfaces/repository/pagos.repository.interface";
import {
  IPagos,
  IPagosDto,
  IPagoDetalle,
  IPagoComprobante,
  IPagosQueryFilters,
} from "../models/pagos.model";

@Injectable({
  providedIn: "root",
})
export class PagosService {
  constructor(
    @Inject("IPagosRepository") private repo: IPagosRepository
  ) {}

  /**
   * Registra un pago sobre una venta activa.
   */
  registrarPago(data: IPagosDto): Observable<IPagos> {
    return this.repo.create(data);
  }

  /**
   * Lista pagos aplicando filtros de venta, metodo y rango de fechas.
   */
  listarPagos(filters?: IPagosQueryFilters): Observable<IPagos[]> {
    return this.repo.getAll(filters);
  }

  /**
   * Obtiene el detalle de un pago y sus aplicaciones a cuotas.
   */
  obtenerPagoPorId(id: string): Observable<IPagoDetalle> {
    return this.repo.getById(id);
  }

  /**
   * Anula logicamente el ultimo pago activo de una venta y revierte saldos.
   */
  anularPago(id: string, motivoAnulacion: string): Observable<IPagoDetalle> {
    return this.repo.anular(id, motivoAnulacion);
  }

  /**
   * Agrega uno o varios comprobantes PDF o imagen a un pago existente.
   */
  agregarComprobantes(id: string, data: FormData): Observable<IPagoComprobante[]> {
    return this.repo.agregarComprobantes(id, data);
  }

  /**
   * Lista los comprobantes adjuntos a un pago.
   */
  listarComprobantes(id: string): Observable<IPagoComprobante[]> {
    return this.repo.getComprobantes(id);
  }

  /**
   * Elimina uno o varios comprobantes adjuntos al pago.
   */
  eliminarComprobantes(id: string, comprobanteIds: string[]): Observable<void> {
    return this.repo.eliminarComprobantes(id, comprobanteIds);
  }
}
