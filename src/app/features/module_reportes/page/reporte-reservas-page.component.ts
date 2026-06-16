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
    const registroTs = this.getTimestamp(criterios.fechaRegistro);
    const vencimientoTs = this.getTimestamp(criterios.fechaVencimiento);

    this.reservasFiltradas = this.reservasOriginales.filter(item => {
      // 1. Filtrar por fecha de registro (como fecha mínima)
      let cumpleRegistro = true;
      if (registroTs) {
        const itemRegistroTs = this.getTimestamp(item.fechaReserva);
        if (itemRegistroTs && itemRegistroTs < registroTs) cumpleRegistro = false;
      }

      // 2. Filtrar por fecha de vencimiento (como fecha máxima)
      let cumpleVencimiento = true;
      if (vencimientoTs) {
        const itemVencimientoTs = this.getTimestamp(item.vencimiento);
        if (itemVencimientoTs && itemVencimientoTs > vencimientoTs) cumpleVencimiento = false;
      }

      // 3. Filtrar por estado
      const cumpleEstado = !criterios.estado || item.estado === criterios.estado;
      
      return cumpleRegistro && cumpleVencimiento && cumpleEstado;
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
    if (this.reservasFiltradas.length === 0 || !this.vistaHijo) return;
    this.exportPdfService.exportAsPdf('Reporte de Reservas', this.vistaHijo.columnas, this.reservasFiltradas);
  }

  public exportarExcel(): void {
    if (this.reservasFiltradas.length === 0 || !this.vistaHijo) return;
    this.exportExcelService.exportAsExcel('Reporte de Reservas', this.vistaHijo.columnas, this.reservasFiltradas);
  }
}