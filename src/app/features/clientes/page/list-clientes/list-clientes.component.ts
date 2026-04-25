import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef, SortModelItem } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { debounceTime, distinctUntilChanged, finalize, Subject, takeUntil } from 'rxjs';
import { ICliente } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { Router } from '@angular/router';
import { DataTableServerComponent } from 'src/app/shared/components/organisms/data-table-server/data-table-server.component';
import { StatusFilterComponent } from 'src/app/shared/components/atoms/status-filter/status-filter.component';

/**
 * LISTA DE CLIENTES - Usa DataTableServerComponent (SERVER-SIDE con búsqueda + paginación)
 * Ideal cuando hay muchos clientes y necesitas búsqueda/filtrado en servidor
 */
@Component({
  selector: 'app-list-clientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageContainerComponent,
    InputTextComponent,
    FormFieldComponent,
    DataTableServerComponent, // 👈 CAMBIO: Ahora usa la versión SERVER
    StatusFilterComponent,
    FormFieldComponent
  ],
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
  public filterActive: boolean | undefined = true;

  private destroy$ = new Subject<void>();

  @ViewChild(DataTableServerComponent) dataTable!: DataTableServerComponent<ICliente>;

  columnDefs: ColDef[] = [
    {
      field: 'codigoCliente',
      headerName: 'Código',
      width: 120,
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
      width: 140,
      valueFormatter: (params) => {
        if (!params.data || !params.value) return params.value;
        return params.data.complemento ? `${params.value} ${params.data.complemento}` : params.value;
      }
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 140
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 220,
      flex: 1,
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 110,
      cellRenderer: BadgeEstadoComponent
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
    // 🔍 Búsqueda reactiva con debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 1; // Reset página al buscar
      this.dataTable.refresh(); // 👈 Usar refresh() para que AG Grid pida datos
    });

    // ⏱️ Ya no es necesario llamar a loadClientes() aquí.
    // DataTableServerComponent disparará el primer pageChange automáticamente
    // al configurarse el datasource en onGridReady.
  }

  /**
   * Cargar clientes desde el servidor con filtros y paginación
   * 👉 Este método interactúa con DataTableServerComponent via los @Output
   */
  loadClientes(): void {
    this.loading = true;
    // 🔴 NO VACIAR: this.clientes = [];
    // Si los vaciamos aquí, ngOnChanges se dispara con datos vacíos
    // Mejor: mantener los datos anteriores hasta que lleguen los nuevos

    const term = this.searchControl.value || undefined;

    this.clienteService.getPagedClients(this.currentPage, this.limit, term, this.filterActive)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          // ✅ ASIGNACIÓN CON SPREAD: Fuerza que Angular detecte el cambio
          // PERO SOLO cuando los datos reales llegan
          this.clientes = [...res.data];
          this.totalRecords = res.total;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('ListClientes [load]: ERROR', err);
          this.notification.error('Error al cargar clientes');
          this.loading = false;
          // En caso de error, también mantener los datos anteriores
        },
      });
  }

  /**
   * Cambiar filtro de estado (Activos, Inactivos, Todos)
   */
  setFilter(active: boolean | undefined): void {
    this.filterActive = active;
    this.currentPage = 1;
    this.dataTable.refresh(); // 👈 Usar refresh() para que AG Grid pida datos
  }

  /**
   * 📌 EVENTO: Cuando el usuario cambia de página en la tabla
   * Este evento viene de DataTableServerComponent (via ag-grid)
   * 
   * FLUJO:
   * 1. Usuario hace clic en página 2
   * 2. AG Grid emite pageChange con número de página
   * 3. Este método se ejecuta
   * 4. Llama a loadClientes()
   * 5. loadClientes() obtiene datos del servidor
   * 6. ngOnChanges se dispara automáticamente
   * 7. Tabla se actualiza con nuevos datos
   */
  onPageChange(newPage: number): void {
    const pageToLoad = newPage < 1 ? 1 : newPage;
    this.currentPage = pageToLoad;
    this.loadClientes();
  }

  /**
   * 📌 EVENTO: Cuando cambia el ordenamiento
   */
  onSortChange(newSort: SortModelItem[]): void {
    this.sortModel = newSort;
    this.currentPage = 1;
    this.loadClientes();
  }

  /**
   * 📌 EVENTO: Cuando cambia el tamaño de página
   */
  onPageSizeChange(newLimit: number): void {
    if (this.limit !== newLimit) {
      this.limit = newLimit;
      this.currentPage = 1;
      this.loadClientes();
    }
  }

  /**
   * 📌 EVENTO: Cuando se hace clic en una acción (Edit, Delete, Info, etc)
   */
  onTableAction(event: ITableActionEvent<ICliente>): void {
    if (event.action === TableActionsEnum.EDIT) {
      this.router.navigate(['/clientes/editar', event.row!.id]);
    }

    if (event.action === TableActionsEnum.DEACTIVATE) {
      this.confirmToggleStatus(event.row!);
    }

    if (event.action === TableActionsEnum.ACTIVATE) {
      this.confirmActivate(event.row!);
    }

    if (event.action === TableActionsEnum.INFO) {
      this.router.navigate(['/clientes/ver', event.row!.id]);
    }
  }

  /**
   * Confirmar desactivación de cliente
   */
  private confirmToggleStatus(cliente: ICliente): void {
    this.nzModal.confirm({
      nzTitle: '¿Desactivar cliente?',
      nzContent: `El cliente ${cliente.nombreCompleto} será desactivado.`,
      nzOkText: 'Confirmar',
      nzOnOk: () => {
        this.clienteService.toggleStatus(cliente.id, cliente.isActive).subscribe({
          next: () => {
            this.notification.success('Cliente desactivado');
            this.dataTable.refresh();
          },
          error: () => this.notification.error('Error al desactivar')
        });
      }
    });
  }

  /**
   * Confirmar activación de cliente
   */
  private confirmActivate(cliente: ICliente): void {
    this.nzModal.confirm({
      nzTitle: '¿Reactivar cliente?',
      nzContent: `El cliente ${cliente.nombreCompleto} será reactivado.`,
      nzOkText: 'Reactivar',
      nzOnOk: () => {
        this.clienteService.toggleStatus(cliente.id, cliente.isActive).subscribe({
          next: () => {
            this.notification.success('Cliente reactivado');
            this.dataTable.refresh();
          },
          error: () => this.notification.error('Error al reactivar')
        });
      }
    });
  }

  /**
   * Agregar nuevo cliente
   */
  onAddNew(): void {
    this.router.navigate(['/clientes/nuevo']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}