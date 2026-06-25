import { Component, inject, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IVentaMensualNodo } from 'src/app/core/models/dashboard-ventas.model';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';

// Componentes del Dashboard
import { TopCardsComponent } from './dashboard-components/top-cards/top-cards.component';
import { FeedsComponent } from './dashboard-components/feeds/feeds.component';
import { TopSellingComponent } from './dashboard-components/top-selling/top-selling.component';
import { BlogCardsComponent } from './dashboard-components/blog-cards/blog-cards.component';
import { VentasMensualesChartsComponent } from './dashboard-components/ventas-mensuales-charts/ventas-mensuales-charts.component';
import { DashboardVentasService } from '../core/services/dashboard-ventas.service';
import { InputDateComponent } from 'src/app/shared/components/atoms/input-date/input-date.component';
import { SelectMonedaComponent } from 'src/app/shared/components/atoms/select-moneda.component';

@Component({
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TopCardsComponent, 
    FeedsComponent, 
    TopSellingComponent, 
    BlogCardsComponent,
    VentasMensualesChartsComponent,
    InputDateComponent,
    SelectMonedaComponent
  ]
})
export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardVentasService);
  private globalContext = inject(ProjectStatusGlobalService);

  public filtroForm!: FormGroup;
  public ventasData: IVentaMensualNodo[] = [];
  public isLoading = true;
  public tieneError = false;

  constructor() {
    // Escuchar activamente los cambios de proyecto en el combobox superior
    effect(() => {
      const projectId = this.globalContext.currentProjectId();
      if (projectId !== undefined) {
        // Cuando cambie el proyecto, recargar las métricas manteniendo los filtros actuales
        if (this.filtroForm) {
          this.cargarMetricasGraficos();
        }
      }
    });
  }

  ngOnInit(): void {
    this.inicializarFiltrosForm();
    this.cargarMetricasGraficos();
  }

  private inicializarFiltrosForm(): void {
    // Comportamiento nativo recomendado por el PDF: Filtro por defecto sin fechas para los últimos 6 meses
    this.filtroForm = this.fb.group({
      fechaDesde: [''],
      fechaHasta: [''],
      moneda: ['USD'] // Por defecto en dólares americanos
    });

    // Escuchar cambios reactivos en cascada
    this.filtroForm.valueChanges.subscribe(() => {
      this.cargarMetricasGraficos();
    });
  }

  public cargarMetricasGraficos(): void {
    this.isLoading = true;
    this.tieneError = false;

    const valoresForm = this.filtroForm.value;
    
    // Mapeo seguro de filtros aplicando formato ISO si se requiere string puro
    const filtros = {
      fechaDesde: valoresForm.fechaDesde ? new Date(valoresForm.fechaDesde).toISOString() : undefined,
      fechaHasta: valoresForm.fechaHasta ? new Date(valoresForm.fechaHasta).toISOString() : undefined,
      moneda: valoresForm.moneda
    };

    this.dashboardService.consultarEstadisticasMensuales(filtros).subscribe({
      next: (res) => {
        this.ventasData = res.ventasMensuales || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar métricas del dashboard:', err);
        this.isLoading = false;
        this.tieneError = true;
      }
    });
  }

  public establecerPresetTemporal(codigoPreset: string): void {
    const hoy = new Date();
    if (codigoPreset === 'ANIO_ACTUAL') {
      const primerDiaAnio = new Date(hoy.getFullYear(), 0, 1);
      this.filtroForm.patchValue({
        fechaDesde: primerDiaAnio.toISOString().substring(0, 10),
        fechaHasta: hoy.toISOString().substring(0, 10)
      }, { emitEvent: true });
    } else if (codigoPreset === 'LIMPIAR') {
      this.filtroForm.patchValue({ fechaDesde: '', fechaHasta: '' }, { emitEvent: true });
    }
  }

  public getControl(name: string): FormControl {
    return this.filtroForm.get(name) as FormControl;
  }
}