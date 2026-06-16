import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { IPagoReporte, IPeriodoReporteQuery } from 'src/app/core/models/reportes/reportes.model';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { InputDateComponent } from 'src/app/shared/components/atoms/input-date/input-date.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';

export interface IFiltroPagoCriterio extends IPeriodoReporteQuery {
  estado?: string;
  metodo?: string;
}

@Component({
  selector: 'app-reporte-pagos-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ReportFilterComponent,
    DataTableComponent,
    InputDateComponent,
    FormFieldComponent,
    SelectDataComponent
  ],
  templateUrl: './reporte-pagos-view.component.html',
  styleUrl: './reporte-pagos-view.component.scss'
})
export class ReportePagosViewComponent implements OnInit {
  @Input({ required: true }) datos: IPagoReporte[] = [];
  @Output() cambioFiltro = new EventEmitter<IFiltroPagoCriterio>();

  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;

  public filterForm!: FormGroup;
  public columnas: ColDef[] = [];

  public estadosPagoOptions = [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'PAGADO', label: 'Pagado' },
    { value: 'ANULADO', label: 'Anulado' }
  ];

  public metodosPagoOptions = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'TARJETA', label: 'Tarjeta' },
    { value: 'DEPOSITO', label: 'Depósito' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: [''],
      estado: [''],
      metodo: ['']
    });
  }

  ngOnInit(): void {
    this.columnas = [
  // 1. Identificadores (Ocultos)
  /* { field: 'id', headerName: 'ID Transacción', minWidth: 120, filter: true, hide: true }, */
  
  // 2. Información del Recibo (Visibles)
  { field: 'codigoPago', headerName: 'Código Pago', minWidth: 120, filter: 'agNumberColumnFilter', sortable: true, cellClass: 'fw-bold' },
  { field: 'venta', headerName: 'Nro. Venta', minWidth: 100, filter: 'agNumberColumnFilter', hide: true },
  {
    field: 'fecha',
    headerName: 'Fecha Pago',
    minWidth: 90,
    sortable: true,
    filter: true,
    valueFormatter: params => {
      if (!params.value) return '';
      const fecha = new Date(params.value);
      return fecha.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
      });
    }
  },
  { field: 'cliente', headerName: 'Cliente / Propietario', filter: true, flex: 1, sortable: true, minWidth: 200 },
  
  // 3. Ubicación (Visibles por separado)
  { field: 'manzana', headerName: 'Manzana', width: 110, filter: true, sortable: true },
  { field: 'lote', headerName: 'Lote', width: 90, filter: 'agNumberColumnFilter', sortable: true },
  
  // 4. Datos del Pago (Visibles)
  { field: 'montoAplicado', headerName: 'Monto Aplicado', minWidth: 140, filter: 'agNumberColumnFilter', hide: true },
  { field: 'monedaVenta', headerName: 'Moneda Venta', minWidth: 100, filter: true, hide: true },
  {
    field: 'montoRecibido',
    headerName: 'Monto Recibido',
    sortable: true,
    filter: 'agNumberColumnFilter',
    cellClass: 'fw-bold text-success',
    minWidth: 140,
    valueFormatter: params => {
      const valor = params.value ?? 0;
      const moneda = params.data?.monedaRecibida || 'BS';
      return `${valor.toLocaleString('es-BO')} ${moneda}`;
    }
  },
  
  // 5. Detalles Financieros y Auditoría (Ocultos)
  { field: 'monedaRecibida', headerName: 'Moneda Recibida', minWidth: 130, filter: true, hide: true },
  { field: 'tipoCambio', headerName: 'Tipo Cambio', minWidth: 90, filter: 'agNumberColumnFilter', hide: true },
  { field: 'metodo', headerName: 'Método Pago', minWidth: 110, filter: true },
  { field: 'registradoPor', headerName: 'Registrado Por', minWidth: 150, filter: true, hide: true },
  
  // 6. Estado (Visible)
  {
    field: 'estado',
    headerName: 'Estado',
    minWidth: 110,
    filter: true,
    cellClass: params => {
      if (params.value === 'ANULADO') return 'text-danger fw-bold';
      if (params.value === 'ACTIVO' || params.value === 'PAGADO') return 'text-success fw-bold';
      return 'text-warning fw-bold';
    }
  }
];



    // Escucha reactiva para emitir filtros al Page (Backend u óptimo local)
    this.filterForm.valueChanges.subscribe(valores => {
      this.cambioFiltro.emit({
        fechaDesde: valores.fechaInicio || undefined,
        fechaHasta: valores.fechaFin || undefined,
        estado: valores.estado || undefined,
        metodo: valores.metodo || undefined
      });
    });
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ fechaInicio: '', fechaFin: '', estado: '', metodo: '' });
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }
}