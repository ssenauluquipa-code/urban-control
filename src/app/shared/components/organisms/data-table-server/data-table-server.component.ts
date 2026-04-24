import {
  Component, Input, Output, EventEmitter, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GridOptions, GridReadyEvent, IDatasource, IGetRowsParams
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { TableActionsComponent } from '../table-actions/table-actions.component';
import { DataTableBaseComponent } from '../data-table-base/data-table-base.component';

/**
 * SERVER: DataTable para datos server-side
 * - Búsqueda en servidor
 * - Paginación servidor
 * - Ideal para > 500 registros
 *
 * Uso:
 * <app-data-table-server
 *   [rowData]="datos"
 *   [columnDefs]="columnas"
 *   [totalRecords]="total"
 *   [pageSize]="limit"
 *   (pageChange)="onPageChange($event)"
 *   (pageSizeChange)="onPageSizeChange($event)"
 * ></app-data-table-server>
 */
@Component({
  selector: 'app-data-table-server',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: '../data-table/data-table.component.html',
  styleUrls: ['../data-table/data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableServerComponent<T = unknown> extends DataTableBaseComponent<T> implements OnChanges {

  // --- Inputs Específicos para server-side ---
  @Input() rowData: T[] = [];
  @Input() totalRecords = 0;
  @Input() pageSize = 10;

  // --- Outputs Específicos para server-side ---
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // --- Configuración específica: server-side ---
  private pendingParams: IGetRowsParams | null = null;

  public gridOptions: GridOptions = {
    rowModelType: 'infinite', // 👈 CLAVE: Infinite scroll / server-side
    cacheBlockSize: this.pageSize,
    maxBlocksInCache: 10,
    pagination: true,
    rowHeight: 52,
    headerHeight: 56,
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 150,
      suppressMovable: true,
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
    // Configuración específica del servidor
    this.gridOptions.paginationPageSize = this.pageSize;
    this.gridOptions.cacheBlockSize = this.pageSize;
    this.gridOptions.infiniteInitialRowCount = 1;
  }

  /**
   * Cuando el grid está listo, configurar el datasource
   */
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.setGridOption('loading', this.loading);
    // Crear el datasource inicial (UNA SOLA VEZ)
    if (!this.gridApi) return;  // Ya existe
    this.setupDatasource();
  }

  /**
   * Configurar el datasource para solicitar datos al componente padre
   * 
   * IMPORTANTE: Este datasource se configura UNA SOLA VEZ
   * Pero su callback (getRows) se ejecuta CADA VEZ que el usuario cambia página
   */
  private setupDatasource(): void {
    if (!this.gridApi) return;

    const dataSource: IDatasource = {
      getRows: (params: IGetRowsParams) => {
        const requestedPage = Math.floor(params.startRow / this.pageSize) + 1;

        // ✅ GUARDAR el params para responder cuando los datos lleguen
        this.pendingParams = params;

        // ✅ Emitir evento al padre para que cargue los datos
        this.pageChange.emit(requestedPage);
      }
    };

    this.gridApi.setGridOption('datasource', dataSource);
  }

  /**
   * Cuando cambian los datos, actualizar el grid
   * PERO SOLO si tenemos datos reales (no vacíos)
   */
  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);

    // 1. Manejar el estado visual de carga (opcional pero recomendado)
    if (this.gridApi && changes['loading']) {
      if (this.loading) this.gridApi.showLoadingOverlay();
      else this.gridApi.hideOverlay();
    }

    // 2. ACTUALIZACIÓN CRÍTICA:
    // Quitamos el "if (this.rowData.length > 0)" para permitir que 
    // la tabla se actualice aunque vengan 0 registros (búsqueda vacía).
    if (this.gridApi && (changes['rowData'] || changes['totalRecords'])) {
      this.updateRowData();
    }
  }

  /**
   * Actualizar los datos en el grid con el nuevo total
   * ESTO SE LLAMA AUTOMÁTICAMENTE cuando rowData o totalRecords cambian
   */
  private updateRowData(): void {
    if (!this.gridApi) return;

    // 🔑 Si hay un pending request de AG Grid, responder INMEDIATAMENTE
    if (this.pendingParams) {

      // Responder con los nuevos datos
      this.pendingParams.successCallback(
        this.rowData || [],
        this.totalRecords);

      this.pendingParams = null;

      // 🟢 NO hacer refreshInfiniteCache() - causa que vuelva a solicitar página 1
      // Solo responder al grid, es suficiente
      this.cdr.detectChanges();

      setTimeout(() => this.gridApi.refreshCells(), 0);
    }
  }

  /**
   * Evento de cambio de tamaño de página
   */
  onPageSizeChanged(newPageSize: number): void {
    if (this.pageSize !== newPageSize) {
      this.pageSize = newPageSize;
      this.gridOptions.paginationPageSize = this.pageSize;
      this.gridOptions.cacheBlockSize = this.pageSize;
      this.pageSizeChange.emit(this.pageSize);

      // Resetear datasource con nuevo tamaño
      if (this.gridApi) {
        this.setupDatasource();
      }
    }
  }

  /**
   * Método para que el padre inicie la carga (llamar después de que AG Grid esté listo)
   * Esto asegura que setupDatasource ya se ejecutó
   */
  public initializeDataLoad(): void {
    // AG Grid solicitará datos automáticamente via pageChange
    // No es necesario hacer nada aquí, AG Grid se encargará
  }

  /**
   * Método para forzar la recarga de datos desde afuera (filtros externos, búsquedas)
   * Esto hará que AG Grid vuelva a solicitar la primera página
   */
  public refresh(): void {
    if (this.gridApi) {
      this.gridApi.refreshInfiniteCache();
    }
  }
}