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
  @Input() pageSize = 10;

  // --- Configuración específica: client-side ---
  public override gridOptions: GridOptions = {
    rowModelType: 'clientSide', // 👈 CLAVE: Client-side
    pagination: true,
    rowHeight: 52,
    headerHeight: 56,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 150,
      suppressMovable: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      suppressFloatingFilterButton: true,
      cellStyle: { display: 'flex', 'align-items': 'center' }
    },
    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Cargando...</span>',
    overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No se encontraron registros</span>',
    localeText: {
      page: 'Página',
      of: 'de',
      to: 'a',
      more: 'más',
      firstPage: 'Primera',
      lastPage: 'Última',
      nextPage: 'Siguiente',
      previousPage: 'Anterior',
      pageSizeSelectorLabel: 'Filas por página:',
      noRowsToShow: 'Sin datos'
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
}