import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { IPagoReporte, IPeriodoReporteQuery } from 'src/app/core/models/reportes/reportes.model';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ReportePagosViewComponent } from '../view/reporte-pagos-view/reporte-pagos-view.component';

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

  public filtrarPagos(criterios: IPeriodoReporteQuery): void {
    this.pagosFiltrados = this.pagosOriginales.filter(pago => {
      if (!pago.fecha) return false;
      const fechaBase = pago.fecha.split('T')[0];
      const cumpleInicio = !criterios.fechaDesde || fechaBase >= criterios.fechaDesde;
      const cumpleFin = !criterios.fechaHasta || fechaBase <= criterios.fechaHasta;
      return cumpleInicio && cumpleFin;
    });
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