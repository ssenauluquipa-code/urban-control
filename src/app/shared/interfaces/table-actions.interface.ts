import { ICellRendererParams } from 'ag-grid-community';

export enum TableActionsEnum {
  VIEW = 'view',
  EDIT = 'edit',
  DELETE = 'delete',
  INFO = 'info',
  ANULAR = 'anular',
  NUEVO = 'nuevo'
}

export type TableAction = TableActionsEnum | string;

export interface ITableActionEvent<T = any> {
  action: TableAction | 'create';
  row: T | null;
}

export interface ITableActionParams<T = any> extends ICellRendererParams<T> {
  actions?: TableAction[];
  actionClicked?: (event: { action: string; data: T | null }) => void;
}
