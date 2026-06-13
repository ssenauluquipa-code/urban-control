import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReporteVentasAsesorViewComponent } from '../view/reporte-ventas-asesor-view/reporte-ventas-asesor-view.component';

@Component({
  selector: 'app-reporte-ventas-asesor-page',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, ReporteVentasAsesorViewComponent],
  template: `
    <app-page-container
      title="Rendimiento de Ventas por Asesor"
      permissionScope="reportes"
      [showOptions]="true"
      [showBack]="true"
      (MenuExportPDF)="exportarPdf()"
      (MenuExportExcel)="exportarExcel()">      
      
      <app-reporte-ventas-asesor-view 
        [datos]="asesoresFiltrados"
        [isLoading]="isLoading"
        (cambioFiltro)="filtrarAsesoresLocal($event)"
        (cambioMoneda)="onMonedaChange($event)">
      </app-reporte-ventas-asesor-view>
    </app-page-container>
  `
})
export class ReporteVentasAsesorPageComponent implements OnInit {
  @ViewChild(ReporteVentasAsesorViewComponent) vistaHijo!: ReporteVentasAsesorViewComponent;

  public asesoresOriginales: any[] = [];
  public asesoresFiltrados: any[] = [];
  public isLoading = false;
  public monedaActual = 'USD';

  private reportesService = inject(ReportesService);
  private projectStatus = inject(ProjectStatusGlobalService);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  constructor() {
    // Escuchamos reactivamente cuando el usuario cambia el proyecto a nivel global
    effect(() => {
      const projectId = this.projectStatus.currentProjectId();
      if (projectId) {
        // Al detectar un cambio (o al cargar la página por primera vez), volvemos a solicitar la data
        this.cargarReporteAsesores(this.monedaActual);
      } else {
        // Si no hay proyecto seleccionado, blanqueamos la tabla
        this.asesoresOriginales = [];
        this.asesoresFiltrados = [];
      }
    });
  }

  ngOnInit(): void {
    // Ya no llamamos cargarDatosDelServicio() manualmente, el effect() se encarga.
  }

  public onMonedaChange(moneda: string): void {
    this.monedaActual = moneda;
    this.cargarReporteAsesores(this.monedaActual);
  }

  private cargarReporteAsesores(moneda: string): void {
    this.isLoading = true;
    // Llama al método real de tu ReportesService mapeado a tu endpoint
    this.reportesService.obtenerReporteVentasAsesor(moneda).subscribe({
      next: (data) => {
        this.asesoresOriginales = data;
        this.asesoresFiltrados = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar reporte de asesores:', err);
        this.isLoading = false;
      }
    });
  }

  public filtrarAsesoresLocal(busqueda: string): void {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) {
      this.asesoresFiltrados = [...this.asesoresOriginales];
      return;
    }
    this.asesoresFiltrados = this.asesoresOriginales.filter(item => 
      item.asesor?.toLowerCase().includes(termino) ||
      item.nroDocumento?.toLowerCase().includes(termino)
    );
  }

  public exportarPdf(): void {
    if (this.asesoresFiltrados.length === 0 || !this.vistaHijo) return;
    this.exportPdfService.exportAsPdf('Reporte de Rendimiento por Asesor', this.vistaHijo.columnas, this.asesoresFiltrados);
  }

  public exportarExcel(): void {
    if (this.asesoresFiltrados.length === 0) return;
    this.exportExcelService.exportAsExcel('Reporte_Ventas_Asesor',this.vistaHijo.columnas, this.asesoresFiltrados);
  }
}