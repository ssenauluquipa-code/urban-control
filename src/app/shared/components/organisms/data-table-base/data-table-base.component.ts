import {
  Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges,
  ViewChild, ElementRef, OnDestroy, ChangeDetectorRef, Directive
} from '@angular/core';
import {
  ColDef, FilterChangedEvent, GridApi, GridOptions, GridReadyEvent, RowClickedEvent, SortModelItem
} from 'ag-grid-community';
import { TableAction, ITableActionEvent } from '../../../interfaces/table-actions.interface';
import { Subject } from 'rxjs';
import { ITableFilterModel } from 'src/app/shared/interfaces/table-filters.interface';

/**
 * BASE: Componente abstracto que contiene la lógica común de ambas tablas
 * Heredan: DataTableComponent (client-side) y DataTableServerComponent (server-side)
 */
@Directive()
export abstract class DataTableBaseComponent<T = unknown> implements OnInit, OnChanges, OnDestroy {
  @ViewChild('gridContainer', { read: ElementRef, static: false }) gridContainer!: ElementRef;

  // --- Inputs Comunes ---
  @Input() columnDefs: ColDef[] = [];
  @Input() loading = false;
  @Input() height = '60vh';
  @Input() showCreate = true;
  @Input() actions: TableAction[] = ['view', 'edit', 'delete'];
  @Input() module = ''; // Nuevo input para el scope de permisos
  @Input() pageSizeOptions: number[] = [25, 50, 100];
  @Input() gridOptions: GridOptions = {};

  // --- Outputs Comunes ---
  @Output() actionClicked = new EventEmitter<ITableActionEvent<T>>();
  @Output() rowClicked = new EventEmitter<T>();
  @Output() sortChange = new EventEmitter<SortModelItem[]>();
  @Output() createClick = new EventEmitter<void>();
  @Output() filterChanged = new EventEmitter<ITableFilterModel>();

  // --- Estado Interno ---
  public gridApi!: GridApi;
  public computedColumnDefs: ColDef[] = [];
  protected destroy$ = new Subject<void>();

  // GridOptions abstracto - cada hijo lo implementa
  /* abstract gridOptions: GridOptions; */

  constructor(protected cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Lógica común de inicialización
    this.computedColumnDefs = this.buildColumns();
    this.gridOptions.paginationPageSizeSelector = this.getPageSizeOptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Lógica común de cambios
    if (changes['columnDefs'] || changes['actions'] || changes['module']) {
      this.computedColumnDefs = this.buildColumns();
    }

    if (this.gridApi && changes['loading']) {
      this.gridApi.setGridOption('loading', this.loading);
    }
  }

  /**
   * Método abstracto que cada hijo implementa según su estrategia
   */
  abstract onGridReady(params: GridReadyEvent): void;

  /**
   * Construir columnas con acciones
   */
  protected buildColumns(): ColDef[] {
    const cols = [...this.columnDefs];
    if (this.actions.length > 0) {
      cols.push(this.buildActionsColumn());
    }
    return cols;
  }

  /**
   * Construir columna de acciones
   */
  protected buildActionsColumn(): ColDef {
    return {
      colId: 'actions',
      headerName: '',
      cellRenderer: 'tableActions',
      cellRendererParams: {
        actions: this.actions,
        module: this.module, // Pasamos el módulo al renderizador de celdas
        actionClicked: (params: { action: string; data: T }) => this.onActionClicked(params)
      },
      suppressNavigable: true,
      pinned: 'right',
      width: this.actions.length > 2 ? 85 : 100,
      minWidth: this.actions.length > 2 ? 85 : 100,
      sortable: false,
      filter: false,
      resizable: false,
      suppressSizeToFit: true
    };
  }

  /**
   * Manejador de acciones
   */
  protected onActionClicked(event: { action: string; data: T }): void {
    this.actionClicked.emit({ action: event.action, row: event.data });
  }

  /**
   * Manejador de clic en fila
   */
  onRowClicked(event: RowClickedEvent): void {
    if (event.data) {
      this.rowClicked.emit(event.data);
    }
  }

  /**
   * Obtener opciones de tamaño de página
   */
  protected getPageSizeOptions(): number[] {
    return this.pageSizeOptions;
  }

  /**
   * Botón crear
   */
  onCreateClick(): void {
    this.createClick.emit();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.gridApi && !this.gridApi.isDestroyed()) {
      this.gridApi.destroy();
    }
  }
  onFilterChanged(event: FilterChangedEvent<T>): void {
    const model = event.api.getFilterModel() as ITableFilterModel;
    this.filterChanged.emit(model);
  }

  public onGridSizeChanged(params: any): void {
    this.adjustColumnsSize(params.api);
  }

  public onFirstDataRendered(params: any): void {
    this.adjustColumnsSize(params.api);
  }

  public adjustColumnsSize(api: GridApi): void {
    if (!api || !this.gridContainer) return;
    
    const gridWidth = this.gridContainer.nativeElement.offsetWidth;
    if (gridWidth > 992) {
      // 🖥️ Desktop: Ajustar columnas proporcionalmente para rellenar toda la pantalla y evitar huecos a la derecha
      api.sizeColumnsToFit();
    } else {
      // 📱 Móviles/Tablets: Autoajustar las columnas que no sean 'flex' para reducir ancho de columnas pequeñas (Código, Estado, Lotes)
      const columns = api.getColumns();
      if (columns) {
        const colIds = columns
          .map(col => col.getColId())
          .filter(id => {
            const colDef = api.getColumnDef(id);
            // Evitamos autoajustar columnas con flex, la columna de acciones o la vacía
            return colDef && !colDef.flex && id !== 'actions' && colDef.headerName !== '';
          });
        if (colIds.length > 0) {
          api.autoSizeColumns(colIds, false);
        }
      }
    }
  }
}
