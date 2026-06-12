import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexStroke, ApexTooltip, ApexDataLabels, ApexGrid } from 'ng-apexcharts';
import { IVentaMensualNodo } from 'src/app/core/models/dashboard-ventas.model';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';

export type ChartOptionsOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  colors: string[];
  grid: ApexGrid;
};

@Component({
  selector: 'app-ventas-mensuales-charts',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, CardContainerComponent],
  templateUrl: './ventas-mensuales-charts.component.html',
  styleUrl: './ventas-mensuales-charts.component.scss'
})
export class VentasMensualesChartsComponent implements OnChanges {
  @Input({ required: true }) dataNodos: IVentaMensualNodo[] = [];
  @Input() divisaSeleccionada: 'BS' | 'USD' = 'USD';

  // Opciones de configuración tipadas para ApexCharts
  public areaChartOptions!: Partial<ChartOptionsOptions>;
  public barChartOptions!: Partial<ChartOptionsOptions>;
  public esGraficoVacio = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataNodos'] && this.dataNodos) {
      this.evaluarEstadoMétricas();
    }
  }

  private evaluarEstadoMétricas(): void {
    // Regla de UX del PDF: Validar si todos los nodos vienen en 0 para activar el "No Data State"
    const totalVentas = this.dataNodos.reduce((sum, n) => sum + n.cantidadVentas, 0);
    const totalMonto = this.dataNodos.reduce((sum, n) => sum + n.montoVendido, 0);
    
    this.esGraficoVacio = (totalVentas === 0 && totalMonto === 0);

    if (!this.esGraficoVacio) {
      this.inicializarGraficos();
    }
  }

  private inicializarGraficos(): void {
    // Extracción de datos limpios de forma paralela para los ejes
    const categoriasX = this.dataNodos.map(n => n.label);
    const seriesCantidad = this.dataNodos.map(n => n.cantidadVentas);
    const seriesMonto = this.dataNodos.map(n => n.montoVendido);

    // 1. Configuración del Gráfico de Área (Cantidad de Ventas)
    this.areaChartOptions = {
      series: [{ name: 'Unidades Vendidas', data: seriesCantidad }],
      chart: {
        type: 'area',
        height: 280,
        fontFamily: 'Nunito Sans, sans-serif',
        toolbar: { show: false }
      },
      colors: ['#1e88e5'], // Azul corporativo para volumen
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2 },
      grid: { borderColor: '#e0e0e0', strokeDashArray: 3 },
      xaxis: { categories: categoriasX },
      yaxis: {
        labels: {
          formatter: (val) => `${Math.floor(val)} u.`
        }
      },
      tooltip: { theme: 'light', y: { formatter: (val) => `${val} propiedades` } }
    };

    // 2. Configuración del Gráfico de Barras (Monto Económico)
    this.barChartOptions = {
      series: [{ name: 'Volumen de Facturación', data: seriesMonto }],
      chart: {
        type: 'bar',
        height: 280,
        fontFamily: 'Nunito Sans, sans-serif',
        toolbar: { show: false }
      },
      colors: ['#26de81'], // Verde esmeralda para el dinero
      dataLabels: { enabled: false },
      grid: { borderColor: '#e0e0e0', strokeDashArray: 3 },
      xaxis: { categories: categoriasX },
      yaxis: {
        labels: {
          formatter: (val) => {
            const simbolo = this.divisaSeleccionada === 'USD' ? '$' : 'Bs.';
            return val >= 1000 ? `${simbolo}${(val / 1000).toFixed(1)}k` : `${simbolo}${val}`;
          }
        }
      },
      tooltip: {
        theme: 'light',
        y: {
          formatter: (val) => {
            const simbolo = this.divisaSeleccionada === 'USD' ? '$' : 'Bs.';
            return `${simbolo}${val.toLocaleString('es-BO')}`;
          }
        }
      }
    };
  }
}