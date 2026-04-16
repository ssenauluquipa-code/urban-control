import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ICellRendererParams, SortModelItem } from 'ag-grid-community';
import { NzModalService } from 'ng-zorro-antd/modal';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { ICliente } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { RegisterClientesComponent } from '../register-clientes/register-clientes.component';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";

@Component({
  selector: 'app-list-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageContainerComponent, InputTextComponent, FormFieldComponent, DataTableComponent],
  templateUrl: './list-clientes.component.html',
  styleUrl: './list-clientes.component.scss'
})
export class ListClientesComponent implements OnInit {

  public tableActionEnum = TableActionsEnum;

  // Data
  public clientes: ICliente[] = [];
  public loading = false;

  // Pagination State
  public currentPage = 1;
  public limit = 10;
  public totalRecords = 0;
  public sortModel: SortModelItem[] = [];

  // Filters
  public searchControl = new FormControl('');
  public filterActive: boolean | undefined = true; // Por defecto muestra activos

  // Column Definitions
  columnDefs: ColDef[] = [
    {
      field: 'codigoCliente',
      headerName: 'Código',
      width: 100,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'nombreCompleto',
      headerName: 'Nombre Completo',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'nroDocumento',
      headerName: 'CI / NIT',
      width: 120,
      valueFormatter: (params) => {
        if (!params.data || !params.value) return params.value;
        return params.data.complemento ? `${params.value} ${params.data.complemento}` : params.value;
      }
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 120
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      suppressSizeToFit: true
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 100,
      cellRenderer: (params: ICellRendererParams) => {
        return params.value
          ? '<span class="badge bg-success-subtle text-success">Activo</span>'
          : '<span class="badge bg-secondary-subtle text-secondary">Inactivo</span>';
      }
    }
  ];

  constructor(
    private clienteService: ClienteService,
    private modalService: NgbModal,
    private nzModal: NzModalService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    // 🚀 IMPORTANTE: En modo serverSide, dejamos que la tabla pida los datos 
    // por primera vez. No llamamos a loadClientes() aquí para evitar doble petición
    // y conflictos de estado.
    // this.loadClientes(); 

    // Búsqueda reactiva
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage = 1; // Resetear página al buscar
      this.loadClientes();
    });
  }

  /**
   * Carga los datos desde el backend con filtros y paginación
   */
  loadClientes(): void {
    console.log('ListClientes [load]: Requesting page', this.currentPage, 'with limit', this.limit);
    this.loading = true;
    const term = this.searchControl.value || undefined;

    this.clienteService.getPagedClients(this.currentPage, this.limit, term, this.filterActive).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (res) => {
        console.log('ListClientes [load]: SUCCESS', { count: res.data.length, total: res.total });
        this.clientes = res.data;
        this.totalRecords = res.total;
      },
      error: () => {
        console.error('ListClientes [load]: ERROR');
        this.notification.error('Error al cargar clientes');
      }
    });
  }

  // --- Acciones de Filtros ---

  setFilter(active: boolean | undefined): void {
    this.filterActive = active;
    this.currentPage = 1; // Resetear página al cambiar filtro
    this.loadClientes();
  }

  // --- Eventos de la Tabla ---

  /**
   * Evento disparado por app-data-table cuando el usuario cambia de página
   */
  onPageChange(newPage: number): void {
    console.log('ListClientes [onPageChange]: newPage =', newPage, 'currentState =', this.currentPage);
    const pageToLoad = newPage < 1 ? 1 : newPage;
    this.currentPage = pageToLoad;
    this.loadClientes();
  }

  /**
   * Captura el cambio de ordenamiento desde la tabla
   */
  onSortChange(newSort: SortModelItem[]): void {
    // Actualizamos el modelo de ordenamiento
    this.sortModel = newSort;
    this.currentPage = 1; // Volvemos a la página 1 al ordenar
    this.loadClientes();
  }

  /**
   * Captura el cambio de tamaño de página desde la tabla
   */
  onPageSizeChange(newLimit: number): void {
    if (this.limit !== newLimit) {
      this.limit = newLimit;
      this.currentPage = 1;
      this.loadClientes();
    }
  }

  onTableAction(event: ITableActionEvent<ICliente>): void {
    if (event.action === TableActionsEnum.EDIT) {
      this.openModal(event.row!);
    }
    if (event.action === TableActionsEnum.DELETE) {
      this.confirmToggleStatus(event.row!);
    }
  }

  onAddNew(): void {
    this.openModal();
  }

  // --- Modales ---

  private openModal(data?: ICliente): void {
    const modalRef = this.modalService.open(RegisterClientesComponent, { size: 'lg' });
    if (data) modalRef.componentInstance.clienteData = data;

    modalRef.result.then((result) => {
      if (result) this.loadClientes();
    }).catch(() => {
      //
    });
  }

  /**
   * Cambia el estado del cliente (Activo <-> Inactivo)
   */
  private confirmToggleStatus(cliente: ICliente): void {
    const action = cliente.isActive ? 'desactivar' : 'activar';

    this.nzModal.confirm({
      nzTitle: `¿${action.charAt(0).toUpperCase() + action.slice(1)} cliente?`,
      nzContent: `Se ${action}á al cliente ${cliente.nombreCompleto}.`,
      nzOkText: 'Confirmar',
      nzOnOk: () =>
        this.clienteService.toggleStatus(cliente.id, cliente.isActive).subscribe({
          next: () => {
            this.notification.success(`Cliente ${action}do`);
            this.loadClientes();
          },
          error: () => this.notification.error('No se pudo cambiar el estado')
        })
    });
  }
}
