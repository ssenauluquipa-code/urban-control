import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReporteClientesMoraViewComponent } from '../view/reporte-clientes-mora-view/reporte-clientes-mora-view.component';

@Component({
  selector: 'app-reporte-clientes-mora-page',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, ReporteClientesMoraViewComponent],
  template: `
    <app-page-container
      title="Reporte de Clientes en Mora (Cartera Vencida)"
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
        <app-reporte-clientes-mora-view 
          [datos]="moraFiltrada"
          (cambioFiltro)="filtrarMoraLocal($event)">
        </app-reporte-clientes-mora-view>
      }
    </app-page-container>
  `
})
export class ReporteClientesMoraPageComponent implements OnInit {
  @ViewChild(ReporteClientesMoraViewComponent) vistaHijo!: ReporteClientesMoraViewComponent;

  public moraOriginal: any[] = [];
  public moraFiltrada: any[] = [];
  public isLoading = false;

  private reportesService = inject(ReportesService);
  private projectStatus = inject(ProjectStatusGlobalService);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  constructor() {
    // Escuchamos reactivamente cuando el usuario cambia el proyecto a nivel global
    effect(() => {
      const projectId = this.projectStatus.currentProjectId();
      if (projectId) {
        this.cargarReporteMora();
      } else {
        this.moraOriginal = [];
        this.moraFiltrada = [];
      }
    });
  }

  ngOnInit(): void {
  }

  private cargarReporteMora(): void {
    this.isLoading = true;
    // Llama al método real de tu service de reportes
    this.reportesService.obtenerReporteClientesMora().subscribe({
      next: (data) => {
        this.moraOriginal = data;
        this.moraFiltrada = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar cartera en mora:', err);
        this.isLoading = false;
      }
    });
  }

  public filtrarMoraLocal(busqueda: string): void {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) {
      this.moraFiltrada = [...this.moraOriginal];
      return;
    }
    this.moraFiltrada = this.moraOriginal.filter(item => 
      item.cliente?.toLowerCase().includes(termino)
    );
  }

  public exportarPdf(): void {
    if (this.moraFiltrada.length === 0 || !this.vistaHijo) return;
    this.exportPdfService.exportAsPdf('Reporte Estadístico de Cartera en Mora', this.vistaHijo.columnas, this.moraFiltrada);
  }

  public exportarExcel(): void {
    if (this.moraFiltrada.length === 0) return;
    this.exportExcelService.exportAsExcel('Reporte_Clientes_Mora', this.vistaHijo.columnas, this.moraFiltrada);
  }
}