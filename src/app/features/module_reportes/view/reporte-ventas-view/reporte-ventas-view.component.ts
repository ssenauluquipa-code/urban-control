import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IVentaReporte } from 'src/app/core/models/reportes/reportes.model';
import { InputDateComponent } from 'src/app/shared/components/atoms/input-date/input-date.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';

export interface IFiltroVentaCriterio {
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

@Component({
  selector: 'app-reporte-ventas-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReportFilterComponent, DataTableComponent, InputDateComponent, FormFieldComponent, SelectDataComponent],
  templateUrl: './reporte-ventas-view.component.html',
  styleUrl: './reporte-ventas-view.component.scss' // Mantiene los estilos de inyección ::ng-deep y hosts de lotes
})
export class ReporteVentasViewComponent implements OnInit, OnDestroy {

  @Input({ required: true }) datos: IVentaReporte[] = [];
  @Output() cambioFiltro = new EventEmitter<IFiltroVentaCriterio>();

  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;
  public columnas: ColDef[] = [];
  public filterForm!: FormGroup;
  private destroy$ = new Subject<void>();

  public estadosVentaOptions = [
    { value: 'ACTIVA', label: 'Activa' },
    { value: 'COMPLETADA', label: 'Completada' },
    { value: 'ANULADA', label: 'Anulada' },
    { value: 'PENDIENTE', label: 'Pendiente' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.configurarColumnas();
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valores) => {
        this.cambioFiltro.emit({
          fechaInicio: valores.fechaInicio || '',
          fechaFin: valores.fechaFin || '',
          estado: valores.estado || ''
        });
      });
  }

  public getControl(nombre: string): FormControl {
    return this.filterForm.get(nombre) as FormControl;
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ fechaInicio: '', fechaFin: '', estado: '' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarColumnas(): void {
    this.columnas = [
      { field: 'nroVenta', headerName: 'Nro. Venta', minWidth: 100, filter: 'agNumberColumnFilter', sortable: true, flex: 1 },
      { 
        field: 'fecha', 
        headerName: 'Fecha Contrato', 
        minWidth: 140, 
        sortable: true, 
        filter: true,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-ES') : '',
        flex: 1 
      },
      { field: 'clienteTitular', headerName: 'Cliente / Propietario', minWidth: 220, filter: true, flex: 2 },
      { field: 'manzana', headerName: 'Mz.', minWidth: 80, filter: true, sortable: true, flex: 1 },
      { field: 'lote', headerName: 'Lote', minWidth: 80, filter: 'agNumberColumnFilter', sortable: true, flex: 1 },
      { field: 'tipoPago', headerName: 'Tipo Pago', minWidth: 90, filter: true, hide: true, flex: 1 },
      { field: 'frecuenciaPago', headerName: 'Frecuencia', minWidth: 120, filter: true, hide: true, flex: 1 },
      { field: 'nroCuotas', headerName: 'Cuotas', minWidth: 90, filter: 'agNumberColumnFilter', hide: true, flex: 1 },
      { 
        field: 'montoTotal', 
        headerName: 'Precio Venta', 
        minWidth: 130,
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: params => {
          if (!params.value) return '0';
          const symbol = params.data?.moneda === 'USD' ? '$' : 'Bs.';
          return `${symbol} ${Number(params.value).toLocaleString('es-BO')}`;
        },
        flex: 1
      },
      { 
        field: 'cuotaInicial', 
        headerName: 'Cuota Inicial', 
        minWidth: 130,
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: params => {
          if (!params.value) return '0';
          const symbol = params.data?.moneda === 'USD' ? '$' : 'Bs.';
          return `${symbol} ${Number(params.value).toLocaleString('es-BO')}`;
        },
        flex: 1,
        hide: true
      },
      { 
        field: 'saldoPendiente', 
        headerName: 'Saldo Financiado', 
        minWidth: 140,
        sortable: true,
        filter: 'agNumberColumnFilter',
        valueFormatter: params => {
          if (!params.value) return '0';
          const symbol = params.data?.moneda === 'USD' ? '$' : 'Bs.';
          return `${symbol} ${Number(params.value).toLocaleString('es-BO')}`;
        },
        flex: 1
      },
      { field: 'moneda', headerName: 'Moneda', minWidth: 90, filter: true, hide: true, flex: 1 },
      { field: 'registradoPor', headerName: 'Registrado Por', minWidth: 140, filter: true, hide: true, flex: 1 },
      { field: 'observaciones', headerName: 'Observaciones', minWidth: 180, filter: true, hide: true, flex: 1 },
      { field: 'estado', headerName: 'Estado', minWidth: 110, filter: true, flex: 1 }
    ];
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }

  public onFiltroModificado(event: IFiltroVentaCriterio): void {
    this.cambioFiltro.emit(event);
  }

}