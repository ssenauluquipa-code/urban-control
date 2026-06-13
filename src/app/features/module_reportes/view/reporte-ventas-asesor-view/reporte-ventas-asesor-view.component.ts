import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { SelectMonedaComponent } from 'src/app/shared/components/atoms/select-moneda.component';
import { Moneda } from 'src/app/core/models/reserva.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-reporte-ventas-asesor-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReportFilterComponent, DataTableComponent, InputTextComponent, SelectMonedaComponent],
  templateUrl: './reporte-ventas-asesor-view.component.html',
  styleUrl: './reporte-ventas-asesor-view.component.scss'
})
export class ReporteVentasAsesorViewComponent implements OnInit {
  @Input({ required: true }) datos: any[] = []; // O la interfaz correspondiente si existe
  @Input() isLoading: boolean = false;
  @Output() cambioFiltro = new EventEmitter<string>();
  @Output() cambioMoneda = new EventEmitter<string>();

  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;

  public filterForm!: FormGroup;
  public columnas: ColDef[] = [];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      buscar: [''],
      moneda: [Moneda.USD]
    });
  }

  get monedaControl(): FormControl {
    return this.filterForm.get('moneda') as FormControl;
  }

  get buscarControl(): FormControl {
    return this.filterForm.get('buscar') as FormControl;
  }

  ngOnInit(): void {
    this.columnas = [
      { field: 'id', headerName: 'ID Asesor', hide: true },
      { field: 'asesor', headerName: 'Asesor / Ejecutivo', minWidth: 200, sortable: true, filter: true, flex: 1 },
      { field: 'nroDocumento', headerName: 'Nº Documento', minWidth: 120, sortable: true, filter: true },
      { field: 'tipo', headerName: 'Tipo', minWidth: 110, filter: true },
      { field: 'genero', headerName: 'Genero', minWidth: 90, filter: true },
      { field: 'telefono', headerName: 'Celular', minWidth: 110 },
      { 
        field: 'cantidadVentas', 
        headerName: 'Cant. Ventas', 
        width: 110, 
        sortable: true, 
        filter: 'agNumberColumnFilter',
        cellClass: 'fw-bold text-center'
      },
      { 
        field: 'montoVendido', 
        headerName: 'Monto Vendido', 
        width: 110, 
        sortable: true, 
        filter: 'agNumberColumnFilter',
        /* valueFormatter: params => params.value ? `$${params.value.toLocaleString('es-BO')}` : '$0' */
      },
      { 
        field: 'cobrado', 
        headerName: 'Total Cobrado', 
        width: 110, 
        sortable: true, 
        filter: 'agNumberColumnFilter',
        cellClass: 'text-success'
      },
      { 
        field: 'saldoPendiente', 
        headerName: 'Saldo Pendiente', 
        minWidth: 110, 
        sortable: true, 
        filter: 'agNumberColumnFilter',
        cellClass: params => params.value > 0 ? 'text-danger fw-bold' : 'text-secondary'
      },
      { field: 'moneda', headerName: 'Moneda', minWidth: 80, filter: true }
    ];

    this.filterForm.get('buscar')?.valueChanges.subscribe(val => {
      this.cambioFiltro.emit(val || '');
    });

    this.filterForm.get('moneda')?.valueChanges.subscribe(val => {
      this.cambioMoneda.emit(val || 'USD');
    });
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }
}