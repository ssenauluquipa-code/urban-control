import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { IClienteReporte } from 'src/app/core/models/reportes/reportes.model';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReportesService } from 'src/app/core/services/reportes/reportes.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ReporteClientesViewComponent } from '../view/reporte-clientes-view/reporte-clientes-view.component';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';

@Component({
  selector: 'app-reporte-clientes-page',
  standalone: true,
  imports: [PageContainerComponent, ReporteClientesViewComponent],
  template: `
    
    <app-page-container title='Reporte de Clientes'
    permissionScope='reportes'
    [showOptions]="true"
    [showBack]="true"
    (MenuExportPDF)="exportarPDF()"
    (MenuExportExcel)="exportExcel()"
    >
      <app-reporte-clientes-view
      #vistaReporte
      [datos]="clienteFiltrado"
      (cambioFiltro)="filtrarClientesLocales($event)"
      ></app-reporte-clientes-view>
    </app-page-container>

  `,
  styles: ``
})
export class ReporteClientesPageComponent implements OnInit {
  private readonly reportesService = inject(ReportesService);
  private readonly projectStatus = inject(ProjectStatusGlobalService);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);
  @ViewChild('vistaReporte') vistaReporte!: ReporteClientesViewComponent;

  public clienteOriginal : IClienteReporte[] = [];
  public clienteFiltrado : IClienteReporte[] = [];
  public loading = false;

  constructor(){
    effect(() => {
      const projectId = this.projectStatus.currentProjectId();
      if (projectId) {
        this.cargarDatosDelServicio();
      } else {
        this.clienteOriginal = [];
        this.clienteFiltrado = [];
      }
    });
  }
  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }

  private cargarDatosDelServicio(): void {
    this.loading = true;
    this.reportesService.obtenerReporteClientes().subscribe({
      next: (data) => {
        this.clienteOriginal = data;
        this.clienteFiltrado = [...data];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar reporte de clientes:', err);
        this.loading = false;
      }
    });
  }

  public filtrarClientesLocales(criterios: { busqueda: string; genero: string }): void {
    const term = criterios.busqueda.toLowerCase().trim();
    this.clienteFiltrado = this.clienteOriginal.filter(cliente => {
      const cumpleBusqueda = !term || 
        cliente.nombreCompleto.toLowerCase().includes(term) || 
        cliente.nroDocumento.toLowerCase().includes(term);
        
      const cumpleGenero = !criterios.genero || cliente.genero === criterios.genero;
      
      return cumpleBusqueda && cumpleGenero;
    });
  }

  public exportarPDF(): void {
    if (this.clienteFiltrado.length === 0) return;
    this.exportPdfService.exportAsPdf(
      'Reporte de Clientes',
      this.vistaReporte.columnas,
      this.clienteFiltrado
    );      
  }
  public exportExcel(): void {
    if (this.clienteFiltrado.length === 0) return;
    this.exportExcelService.exportAsExcel(
      'Reporte de Clientes',
      this.vistaReporte.columnas,
      this.clienteFiltrado
    );      
  }
}
