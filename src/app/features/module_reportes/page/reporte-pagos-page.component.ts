import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { IPagoReporte, IPeriodoReporteQuery } from 'src/app/core/models/reportes/reportes.model';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ReportePagosViewComponent, IFiltroPagoCriterio } from '../view/reporte-pagos-view/reporte-pagos-view.component';

@Component({
  selector: 'app-reporte-pagos-page',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, ReportePagosViewComponent],
  template: `
    <app-page-container
      title="Reporte de Pagos y Recaudaciones"
      permissionScope="reportes"
      [showOptions]="true"
      [showBack]="true"
      (MenuExportPDF)="exportarPdf()"
      (MenuExportExcel)="exportarExcel()">      
      
      @if (isLoading) {
        <div class="d-flex justify-content-center my-5">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      } @else {
        <app-reporte-pagos-view 
          [datos]="pagosFiltrados" 
          (cambioFiltro)="filtrarPagos($any($event))">
        </app-reporte-pagos-view>
      }
    </app-page-container>
  `
})
export class ReportePagosPageComponent implements OnInit {
  @ViewChild(ReportePagosViewComponent) vistaHijo!: ReportePagosViewComponent;

  public pagosOriginales: IPagoReporte[] = [];
  public pagosFiltrados: IPagoReporte[] = [];
  public isLoading = true;

  private reportesService = inject(ReportesService);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  ngOnInit(): void {
    this.cargarReportePagos();
  }

  private cargarReportePagos(): void {
    this.isLoading = true;
    this.reportesService.obtenerReportePagos().subscribe({
      next: (data) => {
        this.pagosOriginales = data;
        this.pagosFiltrados = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar pagos:', err);
        this.isLoading = false;
      }
    });
  }

  public filtrarPagos(criterios: IFiltroPagoCriterio): void {
    const inicioTs = this.getTimestamp(criterios.fechaDesde);
    const finTs = this.getTimestamp(criterios.fechaHasta);

    this.pagosFiltrados = this.pagosOriginales.filter(pago => {
      // Filtrar por fechas
      let cumpleFechas = true;
      const fechaDato = pago.fecha;
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
      const cumpleEstado = !criterios.estado || pago.estado === criterios.estado;

      // Filtrar por metodo
      const cumpleMetodo = !criterios.metodo || pago.metodo === criterios.metodo;
      
      return cumpleFechas && cumpleEstado && cumpleMetodo;
    });
  }

  private getTimestamp(dateInput: any): number {
    if (!dateInput) return 0;
    
    if (dateInput instanceof Date) {
      const d = new Date(dateInput);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    }
    
    let str = String(dateInput).split('T')[0];
    
    const isLatamFormat = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(str);
    if (isLatamFormat) {
       const d = new Date(Number(isLatamFormat[3]), Number(isLatamFormat[2]) - 1, Number(isLatamFormat[1]));
       return d.getTime();
    }
    
    const isIsoFormat = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/.exec(str);
    if (isIsoFormat) {
       const d = new Date(Number(isIsoFormat[1]), Number(isIsoFormat[2]) - 1, Number(isIsoFormat[3]));
       return d.getTime();
    }
    
    const fallback = new Date(dateInput);
    fallback.setHours(0, 0, 0, 0);
    return isNaN(fallback.getTime()) ? 0 : fallback.getTime();
  }

  public exportarPdf(): void {
    if (this.pagosFiltrados.length === 0 || !this.vistaHijo) return;
    this.exportPdfService.exportAsPdf('Reporte de Recaudación de Pagos', this.vistaHijo.columnas, this.pagosFiltrados);
  }

  public exportarExcel(): void {
    if (this.pagosFiltrados.length === 0) return;
    this.exportExcelService.exportAsExcel('Reporte_Pagos_Recaudaciones', this.vistaHijo.columnas, this.pagosFiltrados);
  }
}