import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { IVentaReporte } from 'src/app/core/models/reportes/reportes.model';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ReporteVentasViewComponent, IFiltroVentaCriterio } from '../view/reporte-ventas-view/reporte-ventas-view.component';


@Component({
  selector: 'app-reporte-ventas-page',
  standalone: true,
  imports: [PageContainerComponent, ReporteVentasViewComponent],
  template: `
    <app-page-container
      title="Reporte de Ventas y Contratos"
      permissionScope="reportes"
      [showOptions]="true"
      [showBack]="true"
      (MenuExportPDF)="exportarPdf()"
      (MenuExportExcel)="exportarExcel()"
    >      
      <app-reporte-ventas-view
        [datos]="ventasFiltradas"
        (cambioFiltro)="filtrarVentasEnMemoriaLocal($event)"
      ></app-reporte-ventas-view>
    </app-page-container>
  `
})
export class ReporteVentasPageComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private projectStatusService = inject(ProjectStatusGlobalService);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  @ViewChild(ReporteVentasViewComponent) vistaHijo!: ReporteVentasViewComponent;

  public ventasOriginales: IVentaReporte[] = [];
  public ventasFiltradas: IVentaReporte[] = [];
  public isLoading = false;

  constructor() {
    // Al cambiar de proyecto en el ERP, se actualizan los datos localmente una sola vez
    effect(() => {
      const proyectoId = this.projectStatusService.getCurrentProjectId();
      if (proyectoId) {
        this.cargarDatosVentasPorServicio();
      } else {
        this.ventasOriginales = [];
        this.ventasFiltradas = [];
      }
    });
  }

  ngOnInit(): void {}

  private cargarDatosVentasPorServicio(): void {
    this.isLoading = true;
    this.reportesService.obtenerReporteVentas().subscribe({
      next: (data) => {
        this.ventasOriginales = data;
        this.ventasFiltradas = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar reporte de ventas:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * 🔒 EJECUCIÓN DE FILTRADO LOCAL:
   * Evalúa el rango de fechas directamente sobre el caché de memoria sin consultas HTTP adicionales
   */
  public filtrarVentasEnMemoriaLocal(criterios: IFiltroVentaCriterio): void {
    const inicioTs = this.getTimestamp(criterios.fechaInicio);
    const finTs = this.getTimestamp(criterios.fechaFin);

    this.ventasFiltradas = this.ventasOriginales.filter(item => {
      // Filtrar por fechas
      let cumpleFechas = true;
      const fechaDato = (item as any).fecha || (item as any).fechaVenta;
      
      if (!fechaDato) {
        cumpleFechas = !inicioTs && !finTs;
      } else {
        const itemTs = this.getTimestamp(fechaDato);
        if (itemTs) {
          const cumpleInicio = !inicioTs || itemTs >= inicioTs;
          const cumpleFin = !finTs || itemTs <= finTs;
          cumpleFechas = cumpleInicio && cumpleFin;
        }
      }

      // Filtrar por estado
      const cumpleEstado = !criterios.estado || item.estado === criterios.estado;
      
      return cumpleFechas && cumpleEstado;
    });
  }

  /**
   * Helper para estandarizar de forma robusta cualquier formato de fecha a Timestamp (milisegundos) a las 00:00:00
   */
  private getTimestamp(dateInput: any): number {
    if (!dateInput) return 0;
    
    if (dateInput instanceof Date) {
      const d = new Date(dateInput);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    
    // Remueve posible componente de tiempo ISO si lo hay
    let str = String(dateInput).split('T')[0];
    
    // Regex para detectar formato latino DD/MM/YYYY o DD-MM-YYYY
    const isLatamFormat = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(str);
    if (isLatamFormat) {
       // [1]=DD, [2]=MM, [3]=YYYY
       const d = new Date(Number(isLatamFormat[3]), Number(isLatamFormat[2]) - 1, Number(isLatamFormat[1]));
       return d.getTime();
    }
    
    // Regex para detectar formato estándar YYYY-MM-DD o YYYY/MM/DD
    const isIsoFormat = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.exec(str);
    if (isIsoFormat) {
       // [1]=YYYY, [2]=MM, [3]=DD
       const d = new Date(Number(isIsoFormat[1]), Number(isIsoFormat[2]) - 1, Number(isIsoFormat[3]));
       return d.getTime();
    }
    
    // Fallback nativo
    const fallback = new Date(dateInput);
    fallback.setHours(0, 0, 0, 0);
    return isNaN(fallback.getTime()) ? 0 : fallback.getTime();
  }

  public exportarPdf(): void {
    if (this.ventasFiltradas.length === 0 || !this.vistaHijo) return;
    this.exportPdfService.exportAsPdf('Reporte de Ventas y Contratos', this.vistaHijo.columnas, this.ventasFiltradas);
  }

  public exportarExcel(): void {
    if (this.ventasFiltradas.length === 0 || !this.vistaHijo) return;
    this.exportExcelService.exportAsExcel('Reporte de Ventas y Contratos', this.vistaHijo.columnas, this.ventasFiltradas);
  }
}