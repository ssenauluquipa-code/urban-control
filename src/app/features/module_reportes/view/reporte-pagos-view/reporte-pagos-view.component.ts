import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { IPagoReporte, IPeriodoReporteQuery } from 'src/app/core/models/reportes/reportes.model';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { InputDateComponent } from 'src/app/shared/components/atoms/input-date/input-date.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';

@Component({
  selector: 'app-reporte-pagos-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportFilterComponent,
    DataTableComponent,
    InputDateComponent,
    FormFieldComponent
  ],
  templateUrl: './reporte-pagos-view.component.html',
  styleUrl: './reporte-pagos-view.component.scss'
})
export class ReportePagosViewComponent implements OnInit {
  @Input({ required: true }) datos: IPagoReporte[] = [];
  @Output() cambioFiltro = new EventEmitter<IPeriodoReporteQuery>();

  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;

  public filterForm!: FormGroup;
  public columnas: ColDef[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  ngOnInit(): void {
    this.columnas = [
      { field: 'id', headerName: 'ID Pago', width: 120, filter: true, hide: true },
      {
        field: 'fecha',
        headerName: 'Fecha Pago',
        width: 140,
        sortable: true,
        filter: true,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-BO') : ''
      },
      { field: 'cliente', headerName: 'Cliente / Propietario', filter: true, flex: 1, sortable: true },
      {
        headerName: 'Concepto de Pago',
        filter: true,
        flex: 0.8,
        valueGetter: params => {
          if (!params.data) return '';
          return `Mza. ${params.data.manzana} - Lote ${params.data.lote} (Venta ${params.data.venta})`;
        }
      },
      { field: 'metodo', headerName: 'Método Pago', width: 140, filter: true },
      {
        field: 'montoRecibido',
        headerName: 'Monto Recibido',
        sortable: true,
        filter: 'agNumberColumnFilter',
        cellClass: 'fw-bold text-success',
        valueFormatter: params => {
          const valor = params.value ?? 0;
          const moneda = params.data?.monedaRecibida || 'BS';
          return `${valor.toLocaleString('es-BO')} ${moneda}`;
        }
      },
      {
        field: 'estado',
        headerName: 'Estado',
        width: 120,
        filter: true,
        cellClass: params => {
          if (params.value === 'ANULADO') return 'text-danger fw-bold';
          if (params.value === 'PAGADO') return 'text-success fw-bold';
          return 'text-warning fw-bold';
        }
      }
    ];


    // Escucha reactiva para emitir filtros al Page (Backend u óptimo local)
    this.filterForm.valueChanges.subscribe(valores => {
      this.cambioFiltro.emit({
        fechaDesde: valores.fechaInicio || undefined,
        fechaHasta: valores.fechaFin || undefined
      });
    });
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ fechaInicio: '', fechaFin: '' });
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }
}