import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IReservaReporte } from 'src/app/core/models/reportes/reportes.model';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputDateComponent } from 'src/app/shared/components/atoms/input-date/input-date.component';
import { ColumnVisibilityChange } from 'src/app/features/module_reportes/components/tabla-previsualizacion/tabla-previsualizacion.component';

import { SelectEstadoReservaComponent } from 'src/app/shared/components/atoms/select-estado-reserva.component';

export interface IFiltroReservaCriterio {
  fechaRegistro: string;
  fechaVencimiento: string;
  estado: string;
}

@Component({
  selector: 'app-reporte-reservas-view',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ReportFilterComponent, 
    DataTableComponent,
    FormFieldComponent,
    InputDateComponent,
    SelectEstadoReservaComponent
  ],
  templateUrl: './reporte-reservas-view.component.html',
  styleUrl: './reporte-reservas-view.component.scss' // Reutiliza el SCSS elástico del módulo
})
export class ReporteReservasViewComponent implements OnInit, OnDestroy {

  @Input({ required: true }) datos: IReservaReporte[] = [];
  @Output() cambioFiltro = new EventEmitter<IFiltroReservaCriterio>();
  
  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;
  
  public filterForm!: FormGroup;
  public columnas: ColDef[] = [];
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.configurarColumnas();
    
    // Escucha reactiva local de los cambios en los átomos de fechas
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valores) => {
        this.cambioFiltro.emit({
          fechaRegistro: valores.fechaRegistro || '',
          fechaVencimiento: valores.fechaVencimiento || '',
          estado: valores.estado || ''
        });
      });
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      fechaRegistro: [''],
      fechaVencimiento: [''],
      estado: ['']
    });
  }

  public getControl(nombre: string): FormControl {
    return this.filterForm.get(nombre) as FormControl;
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ fechaRegistro: '', fechaVencimiento: '', estado: '' });
  }

  private configurarColumnas(): void {
    this.columnas = [
  { 
    field: 'codigoReserva', 
    headerName: 'Código Reserva', 
    width: 140, 
    filter: 'agNumberColumnFilter', 
    sortable: true 
  },
  { 
    field: 'fechaReserva', 
    headerName: 'Fecha Registro', 
    width: 150, 
    sortable: true, 
    filter: true,
    valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-BO') : ''
  },
  { 
    field: 'vencimiento', 
    headerName: 'Vence El', 
    width: 130, 
    sortable: true, 
    filter: true,
    valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-BO') : ''
  },
  { 
    field: 'cliente', 
    headerName: 'Interesado / Cliente', 
    filter: true, 
    flex: 1 
  },
  { 
    field: 'manzana', 
    headerName: 'Mz.', 
    width: 100, 
    filter: true, 
    sortable: true 
  },
  { 
    field: 'lote',
    headerName: 'Lote', 
    width: 80, 
    filter: 'agNumberColumnFilter', 
    sortable: true 
  },
  {
    field: 'moneda',
    headerName: 'Moneda',
    width: 90,
    filter: true,
    hide: true
  },
  { 
    field: 'monto', 
    headerName: 'Monto Reserva', 
    sortable: true,
    filter: 'agNumberColumnFilter',
    // Concatenamos dinámicamente la moneda que viene del backend (BS, USD, etc.)
    valueFormatter: params => {
      if (!params.value) return '0';
      const moneda = params.data?.moneda || 'BS'; 
      return `${params.value.toLocaleString('es-BO')} ${moneda}`;
    }
  },
  { 
    field: 'estado',
    headerName: 'Estado', 
    width: 130, 
    filter: true,
    cellClass: params => {
      if (params.value === 'VENCIDA') return 'text-danger fw-bold';
      if (params.value === 'CONVERTIDA') return 'text-success fw-bold';
      return 'text-warning fw-bold'; // Para estados como 'ACTIVA'
    }
  },
  {
    field: 'registradoPor', 
    headerName: 'Registrado Por',
    width: 140,
    filter: true,
    hide: true // Se mantiene oculto por defecto para no saturar la tabla, pero elegible en el selector
  }
];
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}