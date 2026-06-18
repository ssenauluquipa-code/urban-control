import {
  Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GridOptions, GridReadyEvent
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { TableActionsComponent } from '../table-actions/table-actions.component';
import { DataTableBaseComponent } from '../data-table-base/data-table-base.component';

import { themeBalham } from 'ag-grid-community';
/**
 * SIMPLE: DataTable para datos client-side
 * - Filtraje local
 * - Paginación cliente
 * - Ideal para < 500 registros
 *
 * Uso:
 * <app-data-table
 *   [rowData]="datos"
 *   [columnDefs]="columnas"
 *   [loading]="cargando"
 * ></app-data-table>
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = unknown> extends DataTableBaseComponent<T> implements OnChanges {

  // --- Input Específico de esta tabla ---
  @Input() rowData: T[] = [];
  @Input() pageSize = 25;

  // --- Configuración específica: client-side ---
  public override gridOptions: GridOptions = {
    theme: themeBalham,
    rowModelType: 'clientSide', //  CLAVE: Client-side    
    pagination: true,
    rowHeight: 38,
    headerHeight: 38,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: true,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: true,
      suppressFloatingFilterButton: true,
      cellStyle: { display: 'flex', 'align-items': 'center' }
    },
    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Cargando...</span>',
    overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No se encontraron registros</span>',
    localeText: {
      // Paginación
      page: 'Página',
      of: 'de',
      to: 'a',
      more: 'más',
      firstPage: 'Primera',
      lastPage: 'Última',
      nextPage: 'Siguiente',
      previousPage: 'Anterior',
      pageSizeSelectorLabel: 'Filas por página:',
      noRowsToShow: 'No hay datos para mostrar',

      // Filtros
      contains: 'Contiene',
      notContains: 'No contiene',
      startsWith: 'Empieza con',
      endsWith: 'Termina con',
      equals: 'Igual a',
      notEqual: 'Diferente a',
      blank: 'Vacio',
      notBlank: 'No vacio',

      // Filtros de Número
      lessThan: 'Menor que',
      greaterThan: 'Mayor que',
      lessThanOrEqual: 'Menor o igual que',
      greaterThanOrEqual: 'Mayor o igual que',
      inRange: 'En rango',
      inRangeStart: 'Desde',
      inRangeEnd: 'Hasta',

      // Filtros de Fecha
      dateFormatError: 'Error en formato de fecha',

      // Menús
      pinColumn: 'Anclar Columna',
      pinLeft: 'Anclar a la izquierda',
      pinRight: 'Anclar a la derecha',
      noPin: 'Sin anclar',
      autosizeThiscolumn: 'Autoajustar esta columna',
      autosizeAllColumns: 'Autoajustar todas las columnas',
      groupBy: 'Agrupar por',
      ungroupBy: 'Desagrupar por',
      resetColumns: 'Reiniciar columnas',
      expandAll: 'Expandir todo',
      collapseAll: 'Colapsar todo',
      copy: 'Copiar',
      ctrlC: 'Ctrl+C',
      paste: 'Pegar',
      ctrlV: 'Ctrl+V',
      export: 'Exportar',
      csvExport: 'Exportar a CSV',
      excelExport: 'Exportar a Excel',

      // Otros
      loadingOoo: 'Cargando...',
      noMatches: 'Sin coincidencias',
      filterOoo: 'Filtrar...',
      applyFilter: 'Aplicar Filtro...',
      equalsOp: 'IGUAL',
      notEqualOp: 'DIFERENTE',
      lessThanOp: 'MENOR QUE',
      greaterThanOp: 'MAYOR QUE',
      lessThanOrEqualOp: 'MENOR O IGUAL QUE',
      greaterThanOrEqualOp: 'MAYOR O IGUAL QUE',
      inRangeOp: 'EN RANGO',
    },
    context: { parentComponent: this },
    components: { tableActions: TableActionsComponent }
  };

  constructor(cdr: ChangeDetectorRef) {
    super(cdr);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    // Configuración específica del cliente
    this.gridOptions.paginationPageSize = this.pageSize;
  }

  /**
   * Cuando el grid está listo, cargamos los datos
   */
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.setGridOption('loading', this.loading);
    // Cargar datos inmediatamente en cliente
    this.gridApi.setGridOption('rowData', this.rowData);
  }

  /**
   * Cuando cambian los datos, actualizar el grid
   */
  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);

    if (this.gridApi && changes['rowData']) {
      // Simplemente asignar los datos - AG Grid se encarga del resto
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  public override onGridSizeChanged(params: any): void {
    super.onGridSizeChanged(params);
  }

  public override onFirstDataRendered(params: any): void {
    super.onFirstDataRendered(params);
  }
}