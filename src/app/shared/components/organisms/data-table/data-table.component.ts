import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges,
  SimpleChanges, ViewChild, ElementRef,
  OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ColDef, GridApi, GridOptions, GridReadyEvent,
  IDatasource, IGetRowsParams, RowClickedEvent, SortModelItem
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { TableActionsComponent } from '../table-actions/table-actions.component';
import { TableAction, ITableActionEvent } from '../../../interfaces/table-actions.interface';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T = unknown> implements OnInit, OnChanges, OnDestroy {
  @ViewChild('gridContainer', { read: ElementRef, static: false }) gridContainer!: ElementRef;

  // --- Inputs Básicos ---
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: T[] = [];
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() height = '480px';
  @Input() showCreate = true;
  @Input() actions: TableAction[] = ['view', 'edit', 'delete'];
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  // --- Inputs para Paginación por Servidor ---
  @Input() totalRecords = 0;
  @Input() serverSide = false;

  // --- Outputs ---
  @Output() actionClicked = new EventEmitter<ITableActionEvent<T>>();
  @Output() rowClicked = new EventEmitter<T>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<SortModelItem[]>();
  @Output() pageSizeChange = new EventEmitter<number>();

  quickFilter = '';
  public gridApi!: GridApi;
  computedColumnDefs: ColDef[] = [];

  private searchTerm$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private pendingGetRows: IGetRowsParams | null = null;
  private internalCurrentPage = 0; // 👈 Trackeamos qué página tenemos en memoria

  // 🚀 Definimos gridOptions como una propiedad simple
  // La configuración estructural (rowModelType) va aquí, no en setGridOption
  public gridOptions: GridOptions = {
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
      page: 'Página', of: 'de', to: 'a', more: 'más',
      firstPage: 'Primera', lastPage: 'Última',
      nextPage: 'Siguiente', previousPage: 'Anterior',
      pageSizeSelectorLabel: 'Filas por página:', noRowsToShow: 'Sin datos'
    },
    context: { parentComponent: this },
    components: { tableActions: TableActionsComponent }
  };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // 🚀 PASO CLAVE: Configuración estructural ANTES de que cargue la vista
    // Esto soluciona el error de tipos y asegura que la tabla arranque en el modo correcto.
    this.gridOptions.paginationPageSize = this.pageSize;
    this.gridOptions.paginationPageSizeSelector = this.getPageSizeOptions();

    if (this.serverSide) {
      this.gridOptions.rowModelType = 'infinite';
      this.gridOptions.cacheBlockSize = this.pageSize;
      this.gridOptions.infiniteInitialRowCount = 1;
      this.gridOptions.maxBlocksInCache = 10;
    } else {
      this.gridOptions.rowModelType = 'clientSide';
    }

    // Debounce búsqueda
    this.searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((term) => {
      this.searchChange.emit(term);
      if (this.searchChange.observers.length === 0) {
        this.gridApi?.setGridOption('quickFilterText', term);
      }
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;

    // Configuración que SÍ se puede hacer dinámicamente
    this.gridApi.setGridOption('loading', this.loading);

    if (this.serverSide) {
      // Definir DataSource
      const dataSource: IDatasource = {
        getRows: (params: IGetRowsParams) => {
          this.pendingGetRows = params;
          const requestedPage = Math.floor(params.startRow / this.pageSize) + 1;
          this.pageChange.emit(requestedPage);
        }
      };
      this.gridApi.setGridOption('datasource', dataSource);
    } else {
      // Si es modo cliente, cargamos los datos inmediatamente
      this.gridApi.setGridOption('rowData', this.rowData);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnDefs'] || changes['actions']) {
      this.computedColumnDefs = this.buildColumns();
    }

    if (this.gridApi) {
      if (changes['loading']) {
        this.gridApi.setGridOption('loading', this.loading);
      }

      // Si cambian los datos O el total de registros, refrescamos el datasource
      if (changes['rowData'] || changes['totalRecords']) {
        if (this.serverSide) {
          this.provideRowsToGrid();
        } else {
          this.gridApi.setGridOption('rowData', this.rowData);
        }
      }
    }
  }

  private provideRowsToGrid(): void {
    if (this.gridApi) {
      const datasource: IDatasource = {
        getRows: (params: IGetRowsParams) => {
          // Esto le dice a AG Grid: "Aquí están los 5 registros y el nuevo total es 5"
          params.successCallback(this.rowData, this.totalRecords);
        }
      };

      // Esto obliga a AG Grid a resetear la paginación y la vista
      this.gridApi.setGridOption('datasource', datasource);
    }
  }

  onQuickFilterChange(): void {
    this.searchTerm$.next(this.quickFilter);
  }

  onPaginationChanged(): void {
    if (this.gridApi) {
      const newPage = this.gridApi.paginationGetCurrentPage() + 1; // AG Grid usa base 0
      this.pageChange.emit(newPage);
    }
  }

  private getPageSizeOptions(): number[] {
    const options = [...this.pageSizeOptions];
    if (!options.includes(this.pageSize)) options.push(this.pageSize);
    return options.sort((a, b) => a - b);
  }

  onCreateClick(): void {
    this.actionClicked.emit({ action: 'create', row: null });
  }

  private buildColumns(): ColDef[] {
    const cols = [...this.columnDefs];
    if (this.actions.length > 0) {
      cols.push(this.buildActionsColumn());
    }
    return cols;
  }

  private buildActionsColumn(): ColDef {
    return {
      headerName: 'Acciones',
      cellRenderer: 'tableActions',
      cellRendererParams: {
        actions: this.actions,
        actionClicked: (params: { action: string; data: T }) => this.onActionClicked(params)
      },
      suppressNavigable: true,
      pinned: 'right',
      width: this.actions.length > 2 ? 80 : 120,
      minWidth: this.actions.length > 2 ? 80 : 120,
      sortable: false,
      filter: false,
      resizable: false,
      suppressSizeToFit: true
    };
  }

  private onActionClicked(event: { action: string; data: T }) {
    this.actionClicked.emit({ action: event.action, row: event.data });
  }

  onRowClicked(event: RowClickedEvent): void {
    if (event.data) {
      this.rowClicked.emit(event.data);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridApi.destroy();
    }
  }
}