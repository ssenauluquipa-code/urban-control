import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ILoteReporte } from 'src/app/core/models/reportes/reportes.model';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { SelectManzanasComponent } from 'src/app/shared/components/atoms/select-manzanas.component';

export interface IFiltroLoteCriterio {
  manzanaCodigo: string;
  estado: string;
}

@Component({
  selector: 'app-reporte-lotes-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReportFilterComponent,
     DataTableComponent, FormFieldComponent, SelectDataComponent, SelectManzanasComponent],
  templateUrl: './reporte-lotes-view.component.html',
  styleUrl: './reporte-lotes-view.component.scss'
})
export class ReporteLotesViewComponent implements OnInit, OnDestroy {

  // Recibe la información procesada desde el componente Padre (Page)
  @Input({ required: true }) datos: ILoteReporte[] = [];

  // Emite los criterios elegidos en la UI hacia el Padre (Page)
  @Output() cambioFiltro = new EventEmitter<IFiltroLoteCriterio>();
  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;
  public columnas: ColDef[] = [];
  public filterForm!: FormGroup;
  private destroy$ = new Subject<void>();

  public estados: string[] = ['DISPONIBLE', 'RESERVADO', 'VENDIDO', 'BLOQUEADO'];

  public estadosOptions = this.estados.map(e => ({ value: e, label: e }));

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      manzanaCodigo: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.configurarColumnasDeLaTabla();
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valores) => {
        this.cambioFiltro.emit({
          manzanaCodigo: valores.manzanaCodigo || '',
          estado: valores.estado || ''
        });
      });
  }

  public getControl(nombre: string): FormControl {
    return this.filterForm.get(nombre) as FormControl;
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ manzanaCodigo: '', estado: '' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarColumnasDeLaTabla(): void {
    this.columnas = [
  { field: 'proyecto', headerName: 'Proyecto', sortable: true, filter: true },
  { field: 'manzana', headerName: 'Manzana', width: 80, sortable: true, filter: true },
  { field: 'lote', headerName: 'Nro. Lote', width: 70, sortable: true, filter: 'agNumberColumnFilter' },
  { field: 'estado', headerName: 'Estado Comercial', sortable: true, filter: true },
  { field: 'registradoPor', headerName: 'Registrado Por', filter: true },
  { 
    field: 'areaM2', 
    headerName: 'Superficie (m²)', 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    valueFormatter: params => params.value ? `${params.value} m²` : ''
  },
  { 
    field: 'precioReferencial', 
    headerName: 'Precio Ref. ($)', 
    width: 110, 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    valueFormatter: params => params.value ? `$${params.value.toLocaleString()}` : ''
  },
  { field: 'dimensionNorte', headerName: 'Norte (m)', width: 75, hide: true },
  { field: 'dimensionSur', headerName: 'Sur (m)', width: 75, hide: true },
  { field: 'dimensionEste', headerName: 'Este (m)', width: 75, hide: true },
  { field: 'dimensionOeste', headerName: 'Oeste (m)', width:75 , hide: true},
  { field: 'comision', headerName: 'Comisión', filter: 'agNumberColumnFilter', hide: true },
  { field: 'observaciones', headerName: 'Observaciones', tooltipField: 'observaciones', flex: 1 }
];

  }

  /**
   * 🌟 CONTROLADOR LOCAL DE VISIBILIDAD:
   * Aplica de forma directa el cambio del chip simulado sobre el API nativo de AG Grid
   */
  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }

}
