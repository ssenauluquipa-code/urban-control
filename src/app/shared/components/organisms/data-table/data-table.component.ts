import {
  Component, Input, Output, EventEmitter, OnInit, OnChanges,
  SimpleChanges, ViewChild, ElementRef,
  OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef, GridApi, GridOptions, GridReadyEvent, RowClickedEvent } from 'ag-grid-community';
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

  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: T[] = [];
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() height = '480px';
  @Input() showCreate = true;
  @Input() actions: TableAction[] = ['view', 'edit', 'delete'];

  @Output() actionClicked = new EventEmitter<ITableActionEvent<T>>();
  @Output() rowClicked = new EventEmitter<T>();

  /**
   * Emite el término de búsqueda (con debounce) para búsqueda server-side.
   * Si el padre escucha este evento, puede llamar al endpoint /search?term=...
   * y reemplazar el [rowData] con los resultados del servidor.
   * Si nadie escucha, el quickFilter local de ag-grid sigue funcionando.
   */
  @Output() searchChange = new EventEmitter<string>();

  quickFilter = '';
  public gridApi!: GridApi;
  private searchTerm$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  computedColumnDefs: ColDef[] = [];

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSizeSelector: [5, 10, 20, 50],
    rowHeight: 52, // Más espacio entre filas (Dashboard Premium)
    headerHeight: 56, // Cabeceras más destacadas
    defaultColDef: {
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 150,
      suppressMovable: true, // Diseño más estático y profesional
      cellStyle: { display: 'flex', 'align-items': 'center' } // Centrado vertical manual
    },
    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Cargando...</span>',
    overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">No se encontraron registros</span>',
    localeText: {
      page: 'Página', of: 'de', to: 'a', more: 'más',
      firstPage: 'Primera', lastPage: 'Última',
      nextPage: 'Siguiente', previousPage: 'Anterior',
      pageSizeSelectorLabel: 'Filas por página:', noRowsToShow: 'Sin datos',
      filterOoo: 'Filtrar...', contains: 'Contiene', notContains: 'No contiene',
      equals: 'Igual', notEqual: 'No igual', startsWith: 'Empieza con',
      endsWith: 'Termina con', blank: 'Vacío', notBlank: 'No vacío',
      andCondition: 'Y', orCondition: 'O', applyFilter: 'Aplicar', resetFilter: 'Limpiar'
    },
    context: { parentComponent: this },
    components: {
      tableActions: TableActionsComponent
    }
  };

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Debounce del input de búsqueda → emite al padre para búsqueda server-side
    this.searchTerm$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        this.searchChange.emit(term);
        // Si no hay listeners externos, aplicar filtro local como fallback
        if (this.searchChange.observers.length === 0) {
          this.gridApi?.setGridOption('quickFilterText', term);
        }
      });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    // Usamos el setGridOption para evitar el warning de deprecación de showLoadingOverlay
    this.gridApi.setGridOption('loading', this.loading);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnDefs'] || changes['actions']) {
      this.computedColumnDefs = this.buildColumns();
    }

    if (this.gridApi && changes['loading']) {
      this.gridApi.setGridOption('loading', this.loading);
    }
  }

  onQuickFilterChange(): void {
    this.searchTerm$.next(this.quickFilter);
    // Siempre aplicar filtro local también (para respuesta inmediata)
    this.gridApi?.setGridOption('quickFilterText', this.quickFilter);
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
      // Evita que el clic en esta celda active eventos de fila o selección
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
