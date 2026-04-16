import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, ICellRendererParams, SortModelItem } from 'ag-grid-community';
import { NzModalService } from 'ng-zorro-antd/modal';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';
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
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageContainerComponent, InputTextComponent, FormFieldComponent, DataTableComponent],
  templateUrl: './list-clientes.component.html',
  styleUrl: './list-clientes.component.scss'
})
export class ListClientesComponent implements OnInit, OnDestroy {

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
  private destroy$ = new Subject<void>();
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
      width: 120,
      // Hacemos la columna "flexible" para que ocupe espacio o se adapte
      flex: 1,
      cellRenderer: (params: ICellRendererParams) => {
        const isActive = params.value;
        // Clases de Bootstrap para que se vea bonito
        const badgeClass = isActive
          ? 'bg-success-subtle text-success'
          : 'bg-danger-subtle text-danger';
        const text = isActive ? 'Activo' : 'Inactivo';

        return `<span class="badge rounded-pill ${badgeClass}">${text}</span>`;
      }
    }
  ];

  constructor(
    private clienteService: ClienteService,
    private modalService: NgbModal,
    private nzModal: NzModalService,
    private notification: NotificationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    // Búsqueda reactiva
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1; // Resetear página al buscar
      this.loadClientes();
    });
  }

  /**
   * Carga los datos desde el backend con filtros y paginación
   */
  loadClientes(): void {
    this.loading = true;
    this.clientes = [];
    const term = this.searchControl.value || undefined;

    this.clienteService.getPagedClients(this.currentPage, this.limit, term, this.filterActive)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.markForCheck(); // Forzar detección al terminar la carga
      }))
      .subscribe({
        next: (res) => {
          // ASIGNACIÓN CON SPREAD: Esto obliga a la tabla a reaccionar
          this.clientes = [...res.data];
          // ACTUALIZAR TOTALES
          this.totalRecords = res.total;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('ListClientes [load]: ERROR', err);
          this.notification.error('Error al cargar clientes');
        },
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
    const pageToLoad = newPage < 1 ? 1 : newPage;

    //Evitar recargas innecesarias si la página no ha cambiado realmente
    // y ya tenemos datos cargados.
    if (pageToLoad === this.currentPage && this.clientes.length > 0) {
      return;
    }

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
      this.router.navigate(['/clientes/editar', event.row!.id]);
    }
    // Desactivar (Cliente Activo -> Clic en Desactivar)
    if (event.action === TableActionsEnum.DEACTIVATE) {
      // Llamamos a tu servicio toggleStatus (que internamente hace el DELETE)
      this.confirmToggleStatus(event.row!);
    }

    // 3. Activar (Cliente Inactivo -> Clic en Activar)
    if (event.action === TableActionsEnum.ACTIVATE) {
      // Llamamos a tu servicio toggleStatus (que internamente hace el PATCH /activate)
      this.confirmActivate(event.row!);
    }
    if (event.action === TableActionsEnum.INFO) {
      this.router.navigate(['/clientes/ver', event.row!.id]);
    }
  }

  // 🆕 Nuevo método (Reactivar)
  private confirmActivate(cliente: ICliente): void {
    this.nzModal.confirm({
      nzTitle: '¿Reactivar cliente?',
      nzContent: `El cliente ${cliente.nombreCompleto} será reactivado.`,
      nzOkText: 'Reactivar',
      nzOnOk: () => {
        // Pasamos cliente.isActive (que es false)
        this.clienteService.toggleStatus(cliente.id, cliente.isActive).subscribe({
          next: () => {
            this.notification.success('Cliente reactivado');
            this.loadClientes(); // <--- Esto refresca la lista
          },
          error: () => this.notification.error('Error al reactivar')
        });
      }
    });
  }

  onAddNew(): void {
    this.router.navigate(['/clientes/nuevo']);
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
    this.nzModal.confirm({
      nzTitle: '¿Desactivar cliente?',
      nzContent: `El cliente ${cliente.nombreCompleto} será desactivado.`,
      nzOkText: 'Confirmar',
      nzOnOk: () => {
        // Pasamos cliente.isActive (que es true)
        this.clienteService.toggleStatus(cliente.id, cliente.isActive).subscribe({
          next: () => {
            this.notification.success('Cliente desactivado');
            this.loadClientes(); // <--- Esto refresca la lista
          },
          error: () => this.notification.error('Error al desactivar')
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
