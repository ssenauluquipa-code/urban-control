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
  @Input() type: 'area' | 'bar' = 'area';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() iconColor = '';

  // Opciones de configuración tipadas para ApexCharts
  public chartOptions!: Partial<ChartOptionsOptions>;
  public esGraficoVacio = false;

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['dataNodos'] || changes['type'] || changes['divisaSeleccionada']) && this.dataNodos) {
      this.evaluarEstadoMétricas();
    }
  }

  private evaluarEstadoMétricas(): void {
    const totalVentas = this.dataNodos.reduce((sum, n) => sum + n.cantidadVentas, 0);
    const totalMonto = this.dataNodos.reduce((sum, n) => sum + n.montoVendido, 0);
    
    this.esGraficoVacio = (totalVentas === 0 && totalMonto === 0);

    if (!this.esGraficoVacio) {
      this.configurarValoresPorDefecto();
      this.inicializarGrafico();
    }
  }

  private configurarValoresPorDefecto(): void {
    if (this.type === 'area') {
      if (!this.title) this.title = 'Evolución del Volumen (Ventas)';
      if (!this.subtitle) this.subtitle = 'Cantidad total de contratos cerrados por mes';
      if (!this.icon) this.icon = 'bi bi-box-seam';
      if (!this.iconColor) this.iconColor = 'primary';
    } else {
      if (!this.title) this.title = 'Rendimiento Comercial (Ingresos)';
      if (!this.subtitle) this.subtitle = `Monto total facturado normalizado en ${this.divisaSeleccionada}`;
      if (!this.icon) this.icon = 'bi bi-currency-exchange';
      if (!this.iconColor) this.iconColor = 'success';
    }
  }

  private inicializarGrafico(): void {
    const categoriasX = this.dataNodos.map(n => n.label);

    if (this.type === 'area') {
      const seriesCantidad = this.dataNodos.map(n => n.cantidadVentas);
      this.chartOptions = {
        series: [{ name: 'Unidades Vendidas', data: seriesCantidad }],
        chart: {
          type: 'area',
          height: 280,
          fontFamily: 'Nunito Sans, sans-serif',
          toolbar: { show: false }
        },
        colors: ['#1e88e5'],
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
    } else {
      const seriesMonto = this.dataNodos.map(n => n.montoVendido);
      this.chartOptions = {
        series: [{ name: 'Volumen de Facturación', data: seriesMonto }],
        chart: {
          type: 'bar',
          height: 280,
          fontFamily: 'Nunito Sans, sans-serif',
          toolbar: { show: false }
        },
        colors: ['#26de81'],
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
}