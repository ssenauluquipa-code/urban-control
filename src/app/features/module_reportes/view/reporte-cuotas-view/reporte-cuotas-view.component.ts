import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ICuotaPendienteReporte, ICuotasPendientesQuery } from 'src/app/core/models/reportes/reportes.model';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';

@Component({
  selector: 'app-reporte-cuotas-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReportFilterComponent, DataTableComponent, InputTextComponent],
  templateUrl: './reporte-cuotas-view.component.html',
  styleUrl: './reporte-cuotas-view.component.scss'
})
export class ReporteCuotasViewComponent implements OnInit {
  @Input({ required: true }) datos: ICuotaPendienteReporte[] = [];
  @Output() cambioFiltro = new EventEmitter<ICuotasPendientesQuery>();

  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;

  public filterForm!: FormGroup;
  public columnas: ColDef[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      buscar: [''] // Caja elástica para buscar cliente/lote local reactivo
    });
  }

  ngOnInit(): void {
    this.columnas = [
  // 1. Identificadores (Ocultos: Solo uso interno o avanzado)
  /* { field: 'ventaId', headerName: 'ID Cuota', hide: true, filter: true },  */
  
  // 2. Datos de Identificación (Visibles)
  { field: 'venta', headerName: 'Nro. Venta', filter: 'agNumberColumnFilter', minWidth: 120, sortable: true }, 
  { field: 'cliente', headerName: 'Cliente Deudor', filter: true, flex: 1, sortable: true, minWidth: 200 },
  { field: 'lote', headerName: 'Lote', filter: 'agNumberColumnFilter', minWidth: 80, sortable: true },
  { field: 'nroCuota', headerName: 'Nro. Cuota', filter: 'agNumberColumnFilter', minWidth: 110, sortable: true },
  
  // 3. Datos Financieros de Gestión (Monto se oculta, Pagado y Saldo quedan visibles)
  { 
    field: 'monto', 
    headerName: 'Monto Obligación', 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'fw-bold text-muted', // Apagado visualmente si deciden mostrarlo
    minWidth: 140,
    hide: true // RECOMENDADO OCULTAR: El usuario se enfoca en Saldo y Pagado
    /* valueFormatter: params => params.value ? `${params.value.toLocaleString('es-BO')} BS` : '0 BS' */
  },
  { 
    field: 'pagado', 
    headerName: 'Monto Pagado', 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'text-success fw-bold',
    minWidth: 140
    /* valueFormatter: params => params.value ? `${params.value.toLocaleString('es-BO')} BS` : '0 BS' */
  },
  { 
    field: 'saldo', 
    headerName: 'Saldo Pendiente', 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'text-danger fw-bold',
    minWidth: 140
    /* valueFormatter: params => params.value ? `${params.value.toLocaleString('es-BO')} BS` : '0 BS' */
  },
  
  // 4. Fechas (Visible con semáforo de colores)
  { 
    field: 'vencimiento', 
    headerName: 'Vence El', 
    minWidth: 130, 
    sortable: true, 
    filter: true,
    cellClass: params => {
      const estado = params.data?.estado;
      if (estado === 'VENCIDO') return 'text-danger fw-bold';
      if (estado === 'PAGADO') return 'text-success fw-bold';
      if (estado === 'PARCIAL') return 'text-info fw-bold'; 
      return 'text-warning fw-bold'; 
    },
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
  {
    field: 'moneda', headerName: 'Moneda', minWidth: 80, filter: true
  },
  // 5. Estado del Enum (Oculto porque la fecha ya te avisa con colores)
  { 
    field: 'estado', 
    headerName: 'Estado', 
    minWidth: 120, 
    filter: true,
    hide: true, // RECOMENDADO OCULTAR: Evita redundancia visual
    cellClass: params => {
      switch (params.value) {
        case 'VENCIDO': return 'text-danger fw-bold';
        case 'PAGADO': return 'text-success fw-bold';
        case 'PARCIAL': return 'text-info fw-bold'; 
        default: return 'text-warning fw-bold';
      }
    }
  }
];



    this.filterForm.get('buscar')?.valueChanges.subscribe(val => {
      this.cambioFiltro.emit({ term: val || undefined });
    });
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }
}