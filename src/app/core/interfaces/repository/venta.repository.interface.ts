import { Observable } from "rxjs";
import {
  CreateVentaDto,
  IClientePagoById,
  IVenta,
  IVentaActivaCliente,
  IVentaCuota,
  IVentaDetalle,
  IVentaSaldoResumen,
  IContratoVenta,
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

  /** Obtiene el binario Blob del PDF del plan de cuentas */
  getPlanCuentasPdf(ventaId: string, clienteId: string): Observable<Blob>;

  /** Obtiene el binario Blob del PDF del informe de devolución */
  getInformeDevolucionPdf(ventaId: string, clienteId: string): Observable<Blob>;

  /** Métodos para gestión de contratos */
  subirContratos(ventaId: string, archivos: File[]): Observable<any>;
  listarContratos(ventaId: string): Observable<IContratoVenta[]>;
  eliminarContratos(ventaId: string, contratoIds: string[]): Observable<void>;
}
