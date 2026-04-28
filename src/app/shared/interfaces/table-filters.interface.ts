import { IFloatingFilterParams, TextFilterModel } from "ag-grid-community";

export interface IFilterDetail {
    filterType: string;
    type: string;
    filter?: string;
    filterTo?: string;
}

// Aquí aplicamos el estilo que pide tu ESLint
export type ITableFilterModel = Record<string, IFilterDetail | null>;


export interface IClienteFloatingFilterParams extends IFloatingFilterParams<unknown, TextFilterModel> {
    onClienteChange?: (clienteId: string | undefined) => void;
}