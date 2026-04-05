import {
  Component, Input, Output, EventEmitter, OnChanges,
  SimpleChanges, ViewChild, ElementRef, AfterViewInit,
  OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { TableActionsComponent } from '../table-actions/table-actions.component';
import { TableAction, ITableActionEvent } from '../../../interfaces/table-actions.interface';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridAngular],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('gridContainer', { read: ElementRef, static: false }) gridContainer!: ElementRef;

  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: any[] = [];
  @Input() loading: boolean = false;
  @Input() pageSize: number = 10;
  @Input() height: string = '480px';
  @Input() showCreate: boolean = true;
  @Input() actions: TableAction[] = ['view', 'edit', 'delete'];

  @Output() actionClicked = new EventEmitter<ITableActionEvent>();

  quickFilter: string = '';
  public gridApi!: GridApi;
  computedColumnDefs: ColDef[] = [];

  gridOptions: GridOptions = {
    pagination: true,
    paginationPageSizeSelector: [5, 10, 20, 50],
    defaultColDef: { sortable: true, filter: true, resizable: true, flex: 1, minWidth: 150 },
    overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Cargando...</span>',
    overlayNoRowsTemplate: '<span class="ag-overlay-no-rows-center">Sin datos</span>',
    localeText: {
      page: 'Página', of: 'de', to: 'a', more: 'más',
      firstPage: 'Primera', lastPage: 'Última',
      nextPage: 'Siguiente', previousPage: 'Anterior',
      pageSizeSelectorLabel: 'Filas:', noRowsToShow: 'Sin datos',
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

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit(): void {}

  onGridReady(params: any): void {
    this.gridApi = params.api;
    if (this.loading) this.gridApi.showLoadingOverlay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columnDefs'] || changes['actions']) {
      this.computedColumnDefs = this.buildColumns();
    }
    
    if (!this.gridApi) return;
    
    if (changes['loading']) {
      this.loading ? this.gridApi.showLoadingOverlay() : this.gridApi.hideOverlay();
    }
  }

  onQuickFilterChange(): void {
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
    // Usamos el nombre que registramos en 'components'
    cellRenderer: 'tableActions', 
    cellRendererParams: {
      actions: this.actions,
      actionClicked: (params: any) => this.onActionClicked(params)
    },
    pinned: 'right',
    // Calculamos un ancho base: 50px por el botón 'more' o 120px si son botones
    width: this.actions.length > 2 ? 80 : 120,
    minWidth: this.actions.length > 2 ? 80 : 120,
    sortable: false,
    filter: false,
    resizable: false,
    suppressSizeToFit: true // Para que no se encoja al redimensionar
  };
}


private onActionClicked(event: {action: string, data: any}) {
  this.actionClicked.emit({ action: event.action, row: event.data });
}


  ngOnDestroy(): void {
    this.gridApi?.destroy();
  }
}
