export interface ITopcard {
  bgcolor: string;
  icon: string;
  title: string; // El nombre visible (ej. "Lotes Disponibles")
  value: number; // El valor numérico final del backend
  currentValue: number; // El valor animado en pantalla
  estadoFiltro?: string; // El parámetro que enviaremos a la lista de lotes
}

export const topcards: ITopcard[] = [
  {
    bgcolor: "success",
    icon: "bi bi-wallet",
    title: "$21k",
    value: 21000,
    currentValue: 0,
  },
  {
    bgcolor: "danger",
    icon: "bi bi-coin",
    title: "$1k",
    value: 1000,
    currentValue: 0,
  },
  {
    bgcolor: "warning",
    icon: "bi bi-basket3",
    title: "456",
    value: 456,
    currentValue: 0,
  },
  {
    bgcolor: "info",
    icon: "bi bi-bag",
    title: "210",
    value: 210,
    currentValue: 0,
  },
];
