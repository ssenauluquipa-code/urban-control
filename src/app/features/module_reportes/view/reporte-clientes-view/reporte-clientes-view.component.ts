import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { IClienteReporte } from 'src/app/core/models/reportes/reportes.model';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ColumnVisibilityChange, TablaPrevisualizacionComponent } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';
import { FiltroLotesComponent } from "../../components/filtro-lotes/filtro-lotes.component";

@Component({
  selector: 'app-reporte-clientes-view',
  standalone: true,
  imports: [FiltroLotesComponent, TablaPrevisualizacionComponent, DataTableComponent],
  templateUrl: './reporte-clientes-view.component.html',
  styleUrl: './reporte-clientes-view.component.scss'
})
export class ReporteClientesViewComponent implements OnInit {

  @Input({required:true}) datos:IClienteReporte[] = [];
  // Emite los criterios elegidos en la UI hacia el Padre (Page)
  @Output() cambioFiltro = new EventEmitter<{ manzanaId: string; estado: string }>();
  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;
  public columnas: ColDef[] = [];

  ngOnInit(): void {
    this.configurarColumnasDeLaTabla();
  }

  private configurarColumnasDeLaTabla(): void {
    this.columnas = [
      { field: 'nombreCompleto', headerName: 'Nombre Completo', minWidth: 200, sortable: true, filter: true, flex: 2 },
      { field: 'tipoDocumento', headerName: 'Tipo Doc.', minWidth: 100, sortable: true, filter: true, flex: 1 },
      { field: 'nroDocumento', headerName: 'Nro Doc.', minWidth: 120, sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
      { field: 'complemento', headerName: 'Comp.', minWidth: 80, sortable: true, filter: true, hide: true },
      { field: 'telefono', headerName: 'Teléfono', minWidth: 120, sortable: true, filter: true, flex: 1 },
      { field: 'email', headerName: 'Correo Electrónico', minWidth: 180, sortable: true, filter: true, hide: true, flex: 1 },
      { field: 'direccion', headerName: 'Dirección', minWidth: 180, sortable: true, filter: true, hide: true, flex: 1 },
      { 
        field: 'fechaNacimiento', 
        headerName: 'F. Nacimiento', 
        minWidth: 130, 
        sortable: true, 
        filter: true,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '',
        hide: true,
        flex: 1
      },
      { field: 'estadoCivil', headerName: 'Estado Civil', minWidth: 120, sortable: true, filter: true, hide: true },
      { field: 'genero', headerName: 'Género', minWidth: 100, sortable: true, filter: true, hide: true },
      { field: 'ocupacion', headerName: 'Ocupación', minWidth: 140, tooltipField: 'ocupacion', flex: 1 },
      { 
        field: 'fechaRegistro', 
        headerName: 'F. Registro', 
        minWidth: 130, 
        sortable: true, 
        filter: true,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-ES') : '',
        flex: 1 
      },
      { field: 'registradoPor', headerName: 'Registrado Por', minWidth: 140, sortable: true, filter: true, hide: true }
    ];
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }

  public onFiltroModificado(event: { manzanaId: string; estado: string }): void {
    this.cambioFiltro.emit(event);
  }
}
