import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { ILoteReporte } from 'src/app/core/models/reportes/reportes.model';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ReporteLotesViewComponent } from '../view/reporte-lotes-view/reporte-lotes-view.component';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';

@Component({
  selector: 'app-reporte-lotes-page',
  standalone: true,
  imports: [PageContainerComponent, ReporteLotesViewComponent],
  template: `    
    <app-page-container
  title="Reporte: Inventario de Lotes Comercial"
  permissionScope="reportes"
  [showOptions]="true"
  (MenuExportPDF)="exportarPDF()"
>
  <!-- <div header-options class="d-flex gap-2">
    <button class="btn btn-outline-success btn-sm d-flex align-items-center gap-1" 
            [disabled]="lotesFiltrados.length === 0 || isLoading"
            (click)="exportarExcel()">
      <i class="bi bi-file-earmark-excel"></i> Excel
    </button>
    <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" 
            [disabled]="lotesFiltrados.length === 0 || isLoading"
            (click)="exportarPDF()">
      <i class="bi bi-file-earmark-pdf"></i> PDF
    </button>
  </div> -->

  @if (isLoading) {
    <div class="d-flex justify-content-center align-items-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando inventario...</span>
      </div>
    </div>
  } @else {    
    <app-reporte-lotes-view 
      #vistaReporte
      [datos]="lotesFiltrados"
      (cambioFiltro)="filtrarLotesLocales($event)">
    </app-reporte-lotes-view>
  }

</app-page-container>

  `,
  styles: ``
})
export class ReporteLotesPageComponent implements OnInit {

  private readonly reportesService = inject(ReportesService);
  private readonly projectStatus = inject(ProjectStatusGlobalService);
  private exportPdfService = inject(ExportPdfService);
  @ViewChild('vistaReporte') vistaReporte!: ReporteLotesViewComponent;
  // Fuente de verdad de datos (Tipado Estricto)
  public lotesOriginales: ILoteReporte[] = [];
  public lotesFiltrados: ILoteReporte[] = [];
  public isLoading = false;

  constructor() {
    // Escuchamos reactivamente cuando el usuario cambia el proyecto a nivel global
    effect(() => {
      const projectId = this.projectStatus.currentProjectId();
      if (projectId) {
        // Al detectar un cambio (o al cargar la página por primera vez), volvemos a solicitar la data
        this.cargarDatosDelServicio();
      } else {
        // Si no hay proyecto seleccionado, blanqueamos la tabla
        this.lotesOriginales = [];
        this.lotesFiltrados = [];
      }
    });
  }

  ngOnInit(): void {
    // Ya no llamamos cargarDatosDelServicio() manualmente, el effect() se encarga.
  }

  private cargarDatosDelServicio(): void {
    this.isLoading = true;
    this.reportesService.obtenerReporteLotes().subscribe({
      next: (data) => {
        this.lotesOriginales = data;
        this.lotesFiltrados = [...data];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar reporte de lotes:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Responde al evento @Output() emitido desde el View (Hijo)
   */
  public filtrarLotesLocales(criterios: { manzanaId: string; estado: string }): void {
    this.lotesFiltrados = this.lotesOriginales.filter(lote => {
      const cumpleManzana = !criterios.manzanaId || lote.manzana === criterios.manzanaId;
      const cumpleEstado = !criterios.estado || lote.estado === criterios.estado;
      return cumpleManzana && cumpleEstado;
    });
  }

  // Ahora las exportaciones tienen acceso directo e inmediato a 'this.lotesFiltrados'
  public exportarExcel(): void {
    if (this.lotesFiltrados.length === 0) return;
    console.log('Exportando a Excel desde el Padre con datos:', this.lotesFiltrados);
  }

  public exportarPDF(): void {
    if (this.lotesFiltrados.length === 0 || !this.vistaReporte) return;

  this.exportPdfService.exportAsPdf(
    'Reporte de Inventario de Lotes Comercial',
    this.vistaReporte.columnas,
    this.lotesFiltrados
  );
  }

}
