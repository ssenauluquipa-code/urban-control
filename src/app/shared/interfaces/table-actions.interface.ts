import { ICellRendererParams } from "ag-grid-community";

export enum TableActionsEnum {
  VIEW = "view",
  EDIT = "edit",
  DELETE = "delete",
  INFO = "info",
  ANULAR = "anular",
  NUEVO = "nuevo",
  ACTIVATE = "activate",
  DEACTIVATE = "deactivate",
  REMOVE_IMAGE = "remove_image",
  UPLOAD_PHOTO = "upload_photo",
  BLOQUEADO = "bloqueado",
  SET_AVAILABLE = "set_available",
  VENTA = "venta",
  MASS_LOAD = "MASS_LOAD",
  COMPROBANTE = "comprobante",
  PAGO = "pago",
  PLAN_CUENTAS = "PLAN_CUENTAS",
  DEVOLUCION = "DEVOLUCION",
  IMPRIMIR_RECIBO = "imprimir_recibo",
  MANZANAS = "MANZANAS",
  LOTES = "LOTES",
  CONTRATOS = "contratos",
}

export type TableAction = TableActionsEnum | string;

export interface ITableActionEvent<T = unknown> {
  action: TableAction | "create";
  row: T | null;
}

export interface ITableActionParams<
  T = unknown,
> extends ICellRendererParams<T> {
  actions?: TableAction[];
  actionClicked?: (event: { action: string; data: T | null }) => void;
}
