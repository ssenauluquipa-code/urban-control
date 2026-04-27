export interface IFilterDetail {
    filterType: string;
    type: string;
    filter?: string;
    filterTo?: string;
}

// Aquí aplicamos el estilo que pide tu ESLint
export type ITableFilterModel = Record<string, IFilterDetail | null>;