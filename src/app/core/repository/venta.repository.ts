import { Injectable } from "@angular/core";
import { IVentaRepository } from "../interfaces/repository/venta.repository.interface";
import { environment } from "src/environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  CreateVentaDto,
  IClientePagoById,
  IVenta,
  IVentaActivaCliente,
  IVentaCuota,
  IVentaDetalle,
  IVentaSaldoResumen,
  IContratoVenta,
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

  getPlanCuentasPdf(ventaId: string, clienteId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ventaId}/clientes/${clienteId}/plan-cuentas/pdf`, {
      responseType: 'blob' // Obligatorio para archivos adjuntos/binarios
    });
  }

  getInformeDevolucionPdf(ventaId: string, clienteId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ventaId}/clientes/${clienteId}/devolucion/pdf`, {
      responseType: 'blob'
    });
  }

  subirContratos(ventaId: string, archivos: File[]): Observable<any> {
    const formData = new FormData();
    archivos.forEach(file => {
      formData.append('contratos', file);
    });
    return this.http.post<any>(`${this.apiUrl}/${ventaId}/contratos`, formData);
  }

  listarContratos(ventaId: string): Observable<IContratoVenta[]> {
    return this.http.get<IContratoVenta[]>(`${this.apiUrl}/${ventaId}/contratos`);
  }

  eliminarContratos(ventaId: string, contratoIds: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ventaId}/contratos`, {
      body: { contratoIds }
    });
  }
}
