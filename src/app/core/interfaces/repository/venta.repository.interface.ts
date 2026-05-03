import { Observable } from "rxjs";
import { CreateVentaDto, IVenta } from "../../models/venta.model";

export interface IVentaRepository {
  getAll(manzanaId?: string, term?: string): Observable<IVenta[]>;
  getById(id: string): Observable<IVenta>;
  create(dto: CreateVentaDto): Observable<IVenta>;
  anular(id: string): Observable<void>;
}
