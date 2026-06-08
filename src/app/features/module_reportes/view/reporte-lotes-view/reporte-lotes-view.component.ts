import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ILoteReporte } from 'src/app/core/models/reportes/reportes.model';
import { FiltroLotesComponent } from '../../components/filtro-lotes/filtro-lotes.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ColDef } from 'ag-grid-community';
import { ColumnVisibilityChange, TablaPrevisualizacionComponent } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';

@Component({
  selector: 'app-reporte-lotes-view',
  standalone: true,
  imports: [CommonModule, FiltroLotesComponent, DataTableComponent, TablaPrevisualizacionComponent],
  templateUrl: './reporte-lotes-view.component.html',
  styleUrl: './reporte-lotes-view.component.scss'
})
export class ReporteLotesViewComponent implements OnInit {

  // Recibe la información procesada desde el componente Padre (Page)
  @Input({ required: true }) datos: ILoteReporte[] = [];

  // Emite los criterios elegidos en la UI hacia el Padre (Page)
  @Output() cambioFiltro = new EventEmitter<{ manzanaId: string; estado: string }>();
  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;
  // Definición estructural de columnas requeridas por tu tabla global
  public columnas: ColDef[] = [];

  ngOnInit(): void {
    this.configurarColumnasDeLaTabla();
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

  /**
   * Captura el evento del filtro-lotes interno y lo escala al Padre
   */
  public onFiltroModificado(event: { manzanaId: string; estado: string }): void {
    this.cambioFiltro.emit(event);
  }

}
