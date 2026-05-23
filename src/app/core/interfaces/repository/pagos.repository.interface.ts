import { Observable } from "rxjs";
import {
  IPagos,
  IPagosDto,
  IPagoDetalle,
  IPagoComprobante,
  IPagosQueryFilters,
} from "../../models/pagos.model";

export interface IPagosRepository {
  /**
   * Registra un pago sobre una venta activa y lo aplica automaticamente por FIFO sobre las cuotas pendientes.
   * POST /api/v1/pagos
   */
  create(data: IPagosDto): Observable<IPagos>;

  /**
   * Lista pagos y permite filtrar por venta, metodo y rango de fechas.
   * GET /api/v1/pagos
   */
  getAll(filters?: IPagosQueryFilters): Observable<IPagos[]>;

  /**
   * Obtiene el detalle de un pago y sus aplicaciones a cuotas.
   * GET /api/v1/pagos/{id}
   */
  getById(id: string): Observable<IPagoDetalle>;

  /**
   * Anula logicamente el ultimo pago activo de una venta y revierte saldos de venta y cuotas.
   * PATCH /api/v1/pagos/{id}/anular
   */
  anular(id: string, motivoAnulacion: string): Observable<IPagoDetalle>;

  /**
   * Agrega uno o varios comprobantes PDF o imagen a un pago existente.
   * POST /api/v1/pagos/{id}/comprobantes
   */
  agregarComprobantes(id: string, data: FormData): Observable<IPagoComprobante[]>;

  /**
   * Lista los comprobantes adjuntos a un pago.
   * GET /api/v1/pagos/{id}/comprobantes
   */
  getComprobantes(id: string): Observable<IPagoComprobante[]>;

  /**
   * Elimina uno o varios comprobantes adjuntos al pago.
   * DELETE /api/v1/pagos/{id}/comprobantes
   */
  eliminarComprobantes(id: string, comprobanteIds: string[]): Observable<void>;

  /**
   * Registra un pago incluyendo un archivo de comprobante en la misma peticion.
   * POST /api/v1/pagos/con-comprobante
   */
  crearConComprobante(data: FormData): Observable<IPagos>;
}