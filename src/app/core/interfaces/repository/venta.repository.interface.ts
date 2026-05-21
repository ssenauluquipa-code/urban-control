import { Observable } from "rxjs";
import {
  CreateVentaDto,
  IClientePagoById,
  IVenta,
  IVentaActivaCliente,
  IVentaCuota,
  IVentaDetalle,
  IVentaSaldoResumen,
} from "../../models/venta.model";

export interface IVentaRepository {
  getAll(manzanaId?: string, term?: string): Observable<IVenta[]>;
  getById(id: string): Observable<IVentaDetalle>;
  getVentasActivasByCliente(
    clienteId: string,
  ): Observable<IVentaActivaCliente[]>;
  getCuotasByVenta(id: string): Observable<IVentaCuota[]>;
  getSaldoByVenta(id: string): Observable<IVentaSaldoResumen>;
  create(dto: CreateVentaDto): Observable<IVenta>;
  anular(id: string): Observable<void>;
  eliminar(id: string): Observable<void>;
  getVentasPagoPorCliente(clienteId: string): Observable<IClientePagoById[]>;
}
