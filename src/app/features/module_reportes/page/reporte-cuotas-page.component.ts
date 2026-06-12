import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { ICuotaPendienteReporte, ICuotasPendientesQuery } from 'src/app/core/models/reportes/reportes.model';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReporteCuotasViewComponent } from '../view/reporte-cuotas-view/reporte-cuotas-view.component';

@Component({
  selector: 'app-reporte-cuotas-page',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, ReporteCuotasViewComponent],
  template: `
    <app-page-container
      title="Reporte de Cuotas Pendientes"
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
        <app-reporte-cuotas-view 
          [datos]="cuotasFiltradas"
          (cambioFiltro)="filtrarCuotasLocal($event)">
        </app-reporte-cuotas-view>
      }
    </app-page-container>
  `
})
export class ReporteCuotasPageComponent implements OnInit {
  @ViewChild(ReporteCuotasViewComponent) vistaHijo!: ReporteCuotasViewComponent;

  public cuotasOriginales: ICuotaPendienteReporte[] = [];
  public cuotasFiltradas: ICuotaPendienteReporte[] = [];
  public isLoading = false;

  private reportesService = inject(ReportesService);
  private projectStatus = inject(ProjectStatusGlobalService);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  constructor() {
    effect(() => {
      const projectId = this.projectStatus.currentProjectId();
      if (projectId) {
        this.cargarReporteCuotas();
      } else {
        this.cuotasOriginales = [];
        this.cuotasFiltradas = [];
      }
    });
  }

  ngOnInit(): void {
  }

  private cargarReporteCuotas(): void {
    this.isLoading = true;
    this.reportesService.obtenerReporteCuotasPendientes().subscribe({
      next: (data) => {
        this.cuotasOriginales = data;
        this.cuotasFiltradas = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar cuotas pendientes:', err);
        this.isLoading = false;
      }
    });
  }

  public filtrarCuotasLocal(criterio: ICuotasPendientesQuery): void {
    const busqueda = criterio.term?.toLowerCase().trim();
    if (!busqueda) {
      this.cuotasFiltradas = [...this.cuotasOriginales];
      return;
    }
    this.cuotasFiltradas = this.cuotasOriginales.filter(item => 
      item.cliente?.toLowerCase().includes(busqueda)      
    );
  }

  public exportarPdf(): void {
    if (this.cuotasFiltradas.length === 0 || !this.vistaHijo) return;
    this.exportPdfService.exportAsPdf('Reporte de Cuotas y Obligaciones Pendientes', this.vistaHijo.columnas, this.cuotasFiltradas);
  }

  public exportarExcel(): void {
    if (this.cuotasFiltradas.length === 0) return;
    this.exportExcelService.exportAsExcel('Reporte_Cuotas_Pendientes', this.vistaHijo.columnas, this.cuotasFiltradas);
  }
}