import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ICliente } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import {
  ITableActionEvent,
  TableActionsEnum,
} from 'src/app/shared/interfaces/table-actions.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableServerComponent } from 'src/app/shared/components/organisms/data-table-server/data-table-server.component';
import { Router } from '@angular/router';
import { ITableFilterModel } from 'src/app/shared/interfaces/table-filters.interface';
import { StatusFloatingFilterComponent } from 'src/app/shared/components/organisms/status-floating-filter.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ClienteFotoUploadComponent } from '../../components/cliente-foto-upload/cliente-foto-upload.component';

@Component({
  selector: 'app-list-clientes',
  standalone: true,
  imports: [PageContainerComponent, DataTableServerComponent, CommonModule],
  templateUrl: './list-clientes.component.html',
  styleUrls: ['./list-clientes.component.scss'],
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
  private ngbModal = inject(NgbModal);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Definición de columnas SIN el icono de menú (hamburguesa)
  public columnDefs: ColDef[] = [
    {
      field: 'codigoCliente',
      headerName: 'Código',
      width: 90,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'fotoUrl',
      headerName: 'Foto',
      width: 90,
      cellRenderer: (params: ICellRendererParams<ICliente>) => {
        const url = params.value;
        const name = params.data?.nombreCompleto || 'U';
        if (url) {
          return `<img src="${url}" alt="avatar" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">`;
        } else {
          return `<div style="width: 35px; height: 35px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #64748b;">${name.substring(0, 2).toUpperCase()}</div>`;
        }
      },
    },
    {
      field: 'nombreCompleto',
      headerName: 'Nombre de Cliente',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'nroDocumento',
      headerName: 'Documento',
      width: 150,
      valueFormatter: (params) => {
        if (!params.data) return '';
        const data = params.data;
        const tipo = data.tipoDocumento ?? '';
        const nro = data.nroDocumento ?? '';
        const comp = data.complemento ? ` ${data.complemento}` : '';
        return `${tipo} ${nro}${comp}`.trim();
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'telefono',
      headerName: 'Celular',
      width: 110,
      suppressHeaderMenuButton: true,
    },
    {
      field: 'direccion',
      headerName: 'Dirección',
      flex: 1,
      minWidth: 200,
      suppressHeaderMenuButton: true,
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 115,
      cellRenderer: BadgeEstadoComponent,
      filter: true,
      floatingFilter: true,
      floatingFilterComponent: StatusFloatingFilterComponent,
      floatingFilterComponentParams: {
        onStatusChange: (status: boolean | undefined) =>
          this.onStatusFilterChanged(status),
      },
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
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

    this.clienteService
      .getPagedClients(page, this.limit, term, this.currentStatusFilter)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (res) => {
          this.clientes = [...res.data];
          this.totalRecords = res.total;
          this.cdr.detectChanges();
        },
        error: () => this.notification.error('Error al cargar clientes'),
      });
  }

  onTableFilterChanged(filterModel: ITableFilterModel): void {
    this.currentFilterModel = { ...filterModel };
  }

  onStatusFilterChanged(status: boolean | undefined): void {
    this.currentStatusFilter = status;
    if (this.dataTable) {
      this.dataTable.refresh();
    } else {
      this.loadClientes(1);
    }
  }

  onTableAction(event: ITableActionEvent<ICliente>): void {
    const cliente = event.row;
    if (!cliente) return;

    if (event.action === TableActionsEnum.EDIT) {
      this.router.navigate(['/clientes/editar', cliente.id]);
    } else if (
      event.action === TableActionsEnum.DEACTIVATE ||
      event.action === TableActionsEnum.ACTIVATE
    ) {
      this.toggleStatus(cliente);
    } else if (event.action === TableActionsEnum.VIEW) {
      this.router.navigate(['/clientes/ver', cliente.id]);
    } else if (event.action === TableActionsEnum.UPLOAD_PHOTO) {
      this.openUploadPhotoModal(cliente);
    } else if (event.action === TableActionsEnum.REMOVE_IMAGE) {
      this.confirmDeletePhoto(cliente);
    }
  }

  /** Abre un modal con ClienteFotoUploadComponent para subir la foto del cliente */
  private openUploadPhotoModal(cliente: ICliente): void {
    const modalRef = this.ngbModal.open(ClienteFotoUploadComponent, {
      centered: true,
      size: 'md',
      backdrop: 'static',
    });

    modalRef.componentInstance.cliente = cliente;

    modalRef.result
      .then((result) => {
        if (result) {
          if (this.dataTable) this.dataTable.refresh();
        }
      })
      .catch(() => {
        // Modal dismissed
      });
  }

  /** Confirma y elimina la foto del cliente llamando al endpoint DELETE */
  private confirmDeletePhoto(cliente: ICliente): void {
    this.nzModal.confirm({
      nzTitle: '¿Eliminar foto?',
      nzContent: `Se quitará la foto del cliente <strong>${cliente.nombreCompleto}</strong>.`,
      nzOkDanger: true,
      nzOkText: 'Eliminar',
      nzOnOk: () => {
        this.clienteService.deleteFoto(cliente.id).subscribe({
          next: () => {
            this.notification.success('Foto eliminada');
            if (this.dataTable) this.dataTable.refresh();
          },
          error: () => this.notification.error('Error al eliminar la foto'),
        });
      },
    });
  }

  private toggleStatus(cliente: ICliente): void {
    const isActivating = !cliente.isActive;
    this.nzModal.confirm({
      nzTitle: isActivating ? '¿Reactivar cliente?' : '¿Desactivar cliente?',
      nzContent: `El cliente ${cliente.nombreCompleto} cambiará de estado.`,
      nzOnOk: () => {
        this.clienteService
          .toggleStatus(cliente.id, cliente.isActive)
          .subscribe({
            next: () => {
              this.notification.success('Estado actualizado');
              if (this.dataTable) {
                this.dataTable.refresh();
              } else {
                this.loadClientes(this.currentPage);
              }
            },
            error: (err: HttpErrorResponse) => {
              const msg =
                err?.error?.message ||
                'Error al actualizar el estado del cliente';
              this.notification.error(msg);
            },
          });
      },
    });
  }

  onAddNew(): void {
    this.router.navigate(['/clientes/nuevo']);
  }
}
