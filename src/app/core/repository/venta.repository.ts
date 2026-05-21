import { Injectable } from "@angular/core";
import { IVentaRepository } from "../interfaces/repository/venta.repository.interface";
import { environment } from "src/environments/environment.prod";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  CreateVentaDto,
  IClientePagoById,
  IVenta,
  IVentaActivaCliente,
  IVentaCuota,
  IVentaDetalle,
  IVentaSaldoResumen,
} from "../models/venta.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class VentaRepository implements IVentaRepository {
  private readonly apiUrl = environment.apiUrl + "/ventas";

  constructor(private http: HttpClient) {}  

  getAll(manzanaId?: string, term?: string) {
    let params = new HttpParams();
    if (manzanaId) params = params.set("manzanaId", manzanaId);
    if (term) params = params.set("term", term);
    return this.http.get<IVenta[]>(this.apiUrl, { params });
  }

  create(dto: CreateVentaDto): Observable<IVenta> {
    return this.http.post<IVenta>(this.apiUrl, dto);
  }

  anular(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/anular`, {});
  }

  getById(id: string): Observable<IVentaDetalle> {
    return this.http.get<IVentaDetalle>(`${this.apiUrl}/${id}`);
  }

  getVentasActivasByCliente(
    clienteId: string,
  ): Observable<IVentaActivaCliente[]> {
    return this.http.get<IVentaActivaCliente[]>(
      `${this.apiUrl}/cliente/${clienteId}/activas`,
    );
  }

  getCuotasByVenta(id: string): Observable<IVentaCuota[]> {
    return this.http.get<IVentaCuota[]>(`${this.apiUrl}/${id}/cuotas`);
  }

  getSaldoByVenta(id: string): Observable<IVentaSaldoResumen> {
    return this.http.get<IVentaSaldoResumen>(`${this.apiUrl}/${id}/saldo`);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVentasPagoPorCliente(clienteId: string): Observable<IClientePagoById[]> {
    return this.http.get<IClientePagoById[]>(
      `${this.apiUrl}/cliente/${clienteId}/pagos`,
    );
  }
}
