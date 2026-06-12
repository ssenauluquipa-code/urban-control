export interface IVentaMensualNodo {
  mes: string;            // Ej: "2026-05"
  label: string;          // Ej: "May"
  cantidadVentas: number; // Volumen físico (Eje Y del Gráfico de Área)
  montoVendido: number;   // Volumen monetario (Eje Y del Gráfico de Barras)
}

export interface IDashboardVentasResponse {
  fechaDesde: string;
  fechaHasta: string;
  moneda: 'BS' | 'USD';
  ventasMensuales: IVentaMensualNodo[];
}

export interface IDashboardVentasFiltros {
  fechaDesde?: string;
  fechaHasta?: string;
  moneda?: 'BS' | 'USD';
}