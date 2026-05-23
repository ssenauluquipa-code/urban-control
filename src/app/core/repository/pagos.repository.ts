import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IPagosRepository } from "../interfaces/repository/pagos.repository.interface";
import {
  IPagos,
  IPagosDto,
  IPagoDetalle,
  IPagoComprobante,
  IPagosQueryFilters,
} from "../models/pagos.model";

@Injectable({ providedIn: 'root' })
export class PagosRepository implements IPagosRepository {

  private readonly apiUrl = `${environment.apiUrl}/pagos`;

  private http = inject(HttpClient);

  create(data: IPagosDto): Observable<IPagos> {
    return this.http.post<IPagos>(this.apiUrl, data);
  }

  getAll(filters?: IPagosQueryFilters): Observable<IPagos[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.ventaId) params = params.set("ventaId", filters.ventaId);
      if (filters.metodo) params = params.set("metodo", filters.metodo);
      if (filters.estado) params = params.set("estado", filters.estado);
      if (filters.fechaDesde) params = params.set("fechaDesde", filters.fechaDesde);
      if (filters.fechaHasta) params = params.set("fechaHasta", filters.fechaHasta);
    }
    return this.http.get<IPagos[]>(this.apiUrl, { params });
  }

  getById(id: string): Observable<IPagoDetalle> {
    return this.http.get<IPagoDetalle>(`${this.apiUrl}/${id}`);
  }

  /** Anula logicamente el ultimo pago activo */
  anular(id: string, motivoAnulacion: string): Observable<IPagoDetalle> {
    return this.http.patch<IPagoDetalle>(`${this.apiUrl}/${id}/anular`, { motivoAnulacion });
  }

  /** Registra pago con comprobante en una única petición multipart/form-data */
  crearConComprobante(data: FormData): Observable<IPagos> {
    return this.http.post<IPagos>(this.apiUrl, data);
  }

  agregarComprobantes(id: string, data: FormData): Observable<IPagoComprobante[]> {
    return this.http.post<IPagoComprobante[]>(`${this.apiUrl}/${id}/comprobantes`, data);
  }

  getComprobantes(id: string): Observable<IPagoComprobante[]> {
    return this.http.get<IPagoComprobante[]>(`${this.apiUrl}/${id}/comprobantes`);
  }

  eliminarComprobantes(id: string, comprobanteIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/comprobantes`, {
      body: { comprobanteIds }
    });
  }
}
