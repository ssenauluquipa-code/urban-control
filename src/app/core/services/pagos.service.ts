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

  /** Registra un pago sin comprobante */
  registrarPago(data: IPagosDto): Observable<IPagos> {
    return this.repo.create(data);
  }

  /** Lista pagos aplicando filtros */
  listarPagos(filters?: IPagosQueryFilters): Observable<IPagos[]> {
    return this.repo.getAll(filters);
  }

  /** Obtiene detalle de un pago */
  obtenerPagoPorId(id: string): Observable<IPagoDetalle> {
    return this.repo.getById(id);
  }

  /** Anula lógicamente un pago */
  anularPago(id: string, motivoAnulacion: string): Observable<IPagoDetalle> {
    return this.repo.anular(id, motivoAnulacion);
  }

  /** Agrega comprobantes a un pago existente */
  agregarComprobantes(id: string, data: FormData): Observable<IPagoComprobante[]> {
    return this.repo.agregarComprobantes(id, data);
  }

  /** Lista los comprobantes de un pago */
  listarComprobantes(id: string): Observable<IPagoComprobante[]> {
    return this.repo.getComprobantes(id);
  }

  /** Elimina comprobantes de un pago */
  eliminarComprobantes(id: string, comprobanteIds: string[]): Observable<void> {
    return this.repo.eliminarComprobantes(id, comprobanteIds);
  }

  /** Registra un pago con uno o varios archivos adjuntos */
  registrarPagoConArchivo(pagoData: IPagosDto, archivos: File[]): Observable<IPagos> {
    const formData = new FormData();
    formData.append('ventaId', pagoData.ventaId);
    formData.append('monto', pagoData.monto.toString());
    formData.append('monedaRecibida', pagoData.monedaRecibida);
    formData.append('metodo', pagoData.metodo);
    // ISO string for fechaPago
    const fecha = new Date(pagoData.fechaPago);
    formData.append('fechaPago', fecha.toISOString());
    if (pagoData.observaciones) {
      formData.append('observaciones', pagoData.observaciones);
    }
    // Append each file; backend should handle multiple "comprobantes" entries
    archivos?.forEach((file) => {
      formData.append('comprobantes', file);
    });
    return this.repo.crearConComprobante(formData);
  }
}
