import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ICliente } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableServerComponent } from 'src/app/shared/components/organisms/data-table-server/data-table-server.component';
import { Router } from '@angular/router';
import { ITableFilterModel } from 'src/app/shared/interfaces/table-filters.interface';
import { StatusFloatingFilterComponent } from 'src/app/shared/components/organisms/status-floating-filter.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-list-clientes',
  standalone: true,
  imports: [PageContainerComponent, DataTableServerComponent],
  templateUrl: './list-clientes.component.html',
  styleUrls: ['./list-clientes.component.scss']
})
export class ListClientesComponent implements OnInit, OnDestroy {
  @ViewChild(DataTableServerComponent) dataTable!: DataTableServerComponent;

  private destroy$ = new Subject<void>();
  public tableActionEnum = TableActionsEnum;

  // Data
  public clientes: ICliente[] = [];
  public loading = false;
  public totalRecords = 0;
  public limit = 25;
  public currentPage = 1;

  // Filtros
  private currentFilterModel: ITableFilterModel = {};
  private currentStatusFilter: boolean | undefined = undefined;

  // Inyecciones
  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);
  private nzModal = inject(NzModalService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Definición de columnas SIN el icono de menú (hamburguesa)
  public columnDefs: ColDef[] = [
    {
      field: 'codigoCliente',
      headerName: 'Código',
      width: 120,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'nombreCompleto',
      headerName: 'Cliente',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'nroDocumento',
      headerName: 'Documento',
      width: 140,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 130,
      suppressHeaderMenuButton: true
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      suppressHeaderMenuButton: true
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 130,
      cellRenderer: BadgeEstadoComponent,
      filter: true,
      floatingFilter: true,
      floatingFilterComponent: StatusFloatingFilterComponent,
      floatingFilterComponentParams: {
        onStatusChange: (status: boolean | undefined) => this.onStatusFilterChanged(status)
      },
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    }
  ];

  ngOnInit(): void {
    console.error('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClientes(page = 1): void {
    this.currentPage = page;
    this.loading = true;

    // Obtener valores de filtros de texto
    const nombre = this.currentFilterModel['nombreCompleto']?.filter || '';
    const codigo = this.currentFilterModel['codigoCliente']?.filter || '';
    const documento = this.currentFilterModel['nroDocumento']?.filter || '';

    // Si todo está vacío al borrar, 'term' será "" y traerá todo
    const term = (nombre || codigo || documento).trim();

    this.clienteService.getPagedClients(page, this.limit, term, this.currentStatusFilter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res) => {
          this.clientes = [...res.data];
          this.totalRecords = res.total;
          this.cdr.detectChanges();
        },
        error: () => this.notification.error('Error al cargar clientes')
      });
  }

  onTableFilterChanged(filterModel: ITableFilterModel): void {
    this.currentFilterModel = { ...filterModel };
    // AG Grid's native filter change will automatically request new rows via getRows,
    // but just in case, we can rely on its native behavior or force refresh.
    // However, for custom filters that bypass AG Grid's model, we MUST call refresh().
  }

  onStatusFilterChanged(status: boolean | undefined): void {
    this.currentStatusFilter = status;
    if (this.dataTable) {
      this.dataTable.refresh(); // 👈 Esto hace que AG Grid vuelva a pedir los datos (gatillando pageChange)
    } else {
      this.loadClientes(1);
    }
  }

  onTableAction(event: ITableActionEvent<ICliente>): void {
    const cliente = event.row;
    if (!cliente) return;

    if (event.action === TableActionsEnum.EDIT) {
      this.router.navigate(['/clientes/edit', cliente.id]);
    } else if (event.action === TableActionsEnum.DEACTIVATE || event.action === TableActionsEnum.ACTIVATE) {
      this.toggleStatus(cliente);
    }
  }

  private toggleStatus(cliente: ICliente): void {
    const isActivating = !cliente.isActive;
    this.nzModal.confirm({
      nzTitle: isActivating ? '¿Reactivar cliente?' : '¿Desactivar cliente?',
      nzContent: `El cliente ${cliente.nombreCompleto} cambiará de estado.`,
      nzOnOk: () => {
        this.clienteService.toggleStatus(cliente.id, cliente.isActive).subscribe({
          next: () => {
            this.notification.success('Estado actualizado');
            if (this.dataTable) {
              this.dataTable.refresh(); // Gatilla la petición al servidor a través de AG Grid
            } else {
              this.loadClientes(this.currentPage);
            }
          },
          error: () => this.notification.error('Error al actualizar')
        });
      }
    });
  }

  onAddNew(): void {
    this.router.navigate(['/clientes/new']);
  }
}