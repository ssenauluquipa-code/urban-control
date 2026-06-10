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
  { field: 'ventaId', headerName: 'ID Cuota', hide: true }, 
  { field: 'cliente', headerName: 'Cliente Deudor', filter: true, flex: 1, sortable: true },
  { field: 'venta', headerName: 'Nro. Venta', filter: true, width: 120, sortable: true }, 
  { field: 'lote', headerName: 'Lote', filter: 'agNumberColumnFilter', width: 80, sortable: true },
  { field: 'nroCuota', headerName: 'Nro. Cuota', filter: 'agNumberColumnFilter', width: 110 },
  { 
    field: 'monto', 
    headerName: 'Monto Obligación', 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'fw-bold',
    /* valueFormatter: params => params.value ? `${params.value.toLocaleString('es-BO')} BS` : '0 BS' */
  },
  { 
    field: 'saldo', 
    headerName: 'Saldo Pendiente', 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'text-danger fw-bold',
    /* valueFormatter: params => params.value ? `${params.value.toLocaleString('es-BO')} BS` : '0 BS' */
  },
  { 
    field: 'vencimiento', 
    headerName: 'Vence El', 
    width: 130, 
    sortable: true, 
    filter: true,
    cellClass: params => {
      if (params.data?.estado === 'VENCIDO') return 'text-danger fw-bold';
      return 'text-warning fw-bold'; 
    },
    // Formatea la fecha a formato local de Bolivia (día/mes/año) de forma limpia
    valueFormatter: params => {
      if (!params.value) return '';
      const fecha = new Date(params.value);
      return fecha.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC' // Evita desfases por la zona horaria del navegador
      });
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