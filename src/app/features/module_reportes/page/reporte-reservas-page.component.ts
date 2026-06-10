import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ReporteReservasViewComponent, IFiltroReservaCriterio } from '../view/reporte-reservas-view/reporte-reservas-view.component';
import { IReservaReporte } from 'src/app/core/models/reportes/reportes.model';

@Component({
  selector: 'app-reporte-reservas-page',
  standalone: true,
  imports: [PageContainerComponent, ReporteReservasViewComponent],
  template: `
    <app-page-container
      title="Reporte de Reservas Vigentes y Vencidas"
      permissionScope="reportes"
      [showOptions]="true"
      [showBack]="true"      
      (MenuExportPDF)="exportarPdf()"
      (MenuExportExcel)="exportarExcel()"
    >      
      <app-reporte-reservas-view
        [datos]="reservasFiltradas"
        (cambioFiltro)="filtrarReservasEnMemoriaLocal($event)"
      ></app-reporte-reservas-view>
    </app-page-container>
  `
})
export class ReporteReservasPageComponent implements OnInit {
  private reportesService = inject(ReportesService);
  private projectStatusService = inject(ProjectStatusGlobalService);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  @ViewChild(ReporteReservasViewComponent) vistaHijo!: ReporteReservasViewComponent;

  public reservasOriginales: IReservaReporte[] = [];
  public reservasFiltradas: IReservaReporte[] = [];
  public isLoading = false;

  constructor() {
    // Escucha el cambio de proyecto activo de forma reactiva
    effect(() => {
      const proyectoId = this.projectStatusService.currentProjectId();
      if (proyectoId) {
        this.cargarDatosReservas();
      } else {
        this.reservasOriginales = [];
        this.reservasFiltradas = [];
      }
    });
  }

  ngOnInit(): void {}

  private cargarDatosReservas(): void {
    this.isLoading = true;
    this.reportesService.obtenerReporteReservas().subscribe({
      next: (data) => {
        this.reservasOriginales = data;
        this.reservasFiltradas = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar el reporte de reservas:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * 🔒 FILTRADO LOCAL EN MEMORIA CLIENTE
   */
  public filtrarReservasEnMemoriaLocal(criterios: IFiltroReservaCriterio): void {
    this.reservasFiltradas = this.reservasOriginales.filter(item => {
      if (!item.fechaReserva) return false;
      
      // Extraemos solo la porción YYYY-MM-DD
      const fechaItem = item.fechaReserva.split('T')[0];
      
      const cumpleInicio = !criterios.fechaInicio || fechaItem >= criterios.fechaInicio;
      const cumpleFin = !criterios.fechaFin || fechaItem <= criterios.fechaFin;
      
      return cumpleInicio && cumpleFin;
    });
  }

  public exportarPdf(): void {
    if (this.reservasFiltradas.length === 0 || !this.vistaHijo) return;
    this.exportPdfService.exportAsPdf('Reporte de Reservas', this.vistaHijo.columnas, this.reservasFiltradas);
  }

  public exportarExcel(): void {
    if (this.reservasFiltradas.length === 0 || !this.vistaHijo) return;
    this.exportExcelService.exportAsExcel('Reporte de Reservas', this.vistaHijo.columnas, this.reservasFiltradas);
  }
}