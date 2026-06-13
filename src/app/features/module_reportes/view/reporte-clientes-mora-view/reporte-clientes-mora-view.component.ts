import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";

@Component({
  selector: 'app-reporte-clientes-mora-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReportFilterComponent, DataTableComponent, InputTextComponent],
  templateUrl: './reporte-clientes-mora-view.component.html',
  styleUrl: './reporte-clientes-mora-view.component.scss'
})
export class ReporteClientesMoraViewComponent implements OnInit {
  @Input({ required: true }) datos: any[] = [];
  @Output() cambioFiltro = new EventEmitter<string>();

  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;

  public filterForm!: FormGroup;
  public columnas: ColDef[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      term: ['']
    });
  }

  ngOnInit(): void {
    this.columnas = [
  /* { field: 'id', headerName: 'Venta ID', hide: true }, */
  { field: 'cliente', headerName: 'Titular en Mora', minWidth: 200, sortable: true, filter: true, flex: 1 },
  { field: 'telefono', headerName: 'Celular', minWidth: 110, filter: true }, // Se añadió filtro para búsquedas rápidas
  { 
    field: 'venta', 
    headerName: 'Código Venta', 
    minWidth: 90, 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'fw-bold'
  },
  { field: 'manzana', headerName: 'Mz.', width: 80, sortable: true, filter: true },
  { field: 'lote', headerName: 'Lote', width: 70, sortable: true, filter: 'agNumberColumnFilter' },
  { 
    field: 'cuotasVencidas', 
    headerName: 'Cuotas Vencidas', 
    minWidth: 110, 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'text-danger fw-bold text-center'
  },
  { 
    field: 'montoVencido', 
    headerName: 'Monto Vencido ($)', 
    minWidth: 110, 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: 'text-danger fw-bold',
    /* valueFormatter: params => params.value ? `$${params.value.toLocaleString('es-BO')}` : '$0' */
  },
  { 
    field: 'diasAtraso', 
    headerName: 'Días de Atraso', 
    minWidth: 90, 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    cellClass: params => {
      // Dinámico: Si tiene más de 0 días, resalta en rojo; si es 0, estilo normal
      return params.value > 0 ? 'text-danger text-center fw-bold' : 'text-center';
    }
  },
  { 
    field: 'saldoTotalVenta', 
    headerName: 'Saldo Total Venta ($)', 
    minWidth: 130, 
    sortable: true, 
    filter: 'agNumberColumnFilter',
    /* valueFormatter: params => params.value ? `$${params.value.toLocaleString('es-BO')}` : '$0' */
  },
  { field: 'moneda', headerName: 'Moneda', minWidth: 80, filter: true }
];


    this.filterForm.get('term')?.valueChanges.subscribe(val => {
      this.cambioFiltro.emit(val || '');
    });
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }
}