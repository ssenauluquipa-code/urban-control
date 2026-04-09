import { Component, OnInit } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { IUser } from 'src/app/core/models/user.model';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { ColDef, ICellRendererParams, CellClassParams } from 'ag-grid-community';
import { UserService } from 'src/app/core/services/user.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { CommonModule } from '@angular/common';
import { UserRegisterComponent } from '../user-register.component';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [PageContainerComponent, DataTableComponent, CommonModule, NzModalModule],
  template: `
    
    <app-page-container
      title="Gestión de Usuarios"
      permissionScope="usuarios"
      [showNew]="true"
      [showOptions]="true"
      (onAddNew)="onAddNewUser()">

      <!-- Eliminamos el selector de proyectos porque la lista de usuarios es global -->

      <app-data-table
        [rowData]="(users$ | async) || []"
        [columnDefs]="columnDefs"
        [loading]="isLoading"
        height="350px"
        [showCreate]="false"
        [actions]="[tableActionEnum.EDIT, tableActionEnum.ACTIVATE, tableActionEnum.DEACTIVATE, tableActionEnum.REMOVE_IMAGE]"
        (actionClicked)="onTableAction($event)">
      </app-data-table>
    </app-page-container>

  `,
  styles: ``
})
export class UserListComponent implements OnInit {
  
  public tableActionEnum = TableActionsEnum;
  public users$!: Observable<IUser[]>;
  public isLoading = false;


  // Definición de columnas para Usuarios
  columnDefs: ColDef[] = [
    {
      field: 'avatarUrl',
      headerName: '',
      width: 70,
      // Usamos cellRenderer para mostrar la imagen directamente en la celda
      cellRenderer: (params: ICellRendererParams<IUser>) => {
        const url = params.value;
        const name = params.data?.name || 'U';
        // Si hay URL, muestra imagen. Si no, muestra iniciales en un círculo.
        if (url) {
          return `<img src="${url}" alt="avatar" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">`;
        } else {
          return `<div style="width: 35px; height: 35px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #64748b;">${name.substring(0, 2).toUpperCase()}</div>`;
        }
      }
    },
    { field: 'name', headerName: 'Nombre Completo', filter: true, width: 200 },
    { field: 'email', headerName: 'Correo Electrónico', width: 250 },
    { field: 'contactNumber', headerName: 'Teléfono', width: 140 },
    {
      field: 'role',
      headerName: 'Rol',
      width: 150,
      cellStyle: (params: CellClassParams<IUser>) => {
        const styles: Record<string, string | number> = { fontWeight: 'bold' };
        if (params.value === 'SUPER_ADMIN') styles['color'] = '#dc2626'; // Rojo
        if (params.value === 'ADMIN') styles['color'] = '#2563eb'; // Azul
        if (params.value === 'USER') styles['color'] = '#059669'; // Verde
        return styles;
      }
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 120,
      cellRenderer: (params: ICellRendererParams<IUser>) => {
        const active = params.value;
        const color = active ? '#10b981' : '#ef4444'; // Verde : Rojo
        const text = active ? 'Activo' : 'Inactivo';
        return `<span style="background: ${color}15; color: ${color}; padding: 4px 10px; border-radius: 20px; font-weight: 500; font-size: 12px;">${text}</span>`;
      }
    }
  ];

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService
  ) { }

  ngOnInit(): void {
    this.refreshData();
  }

  refreshData() {
    this.isLoading = true;
    // Llamamos al servicio global (sin projectId)
    this.users$ = this.userService.getUsers().pipe(
      finalize(() => this.isLoading = false)
    );
  }

  onTableAction(event: ITableActionEvent<IUser>) {
    console.log(`Acción: ${event.action} para el usuario:`, event.row);

    if (!event.row) return;

    if (event.action === TableActionsEnum.EDIT) {
      this.openModal(event.row);
    }

    if (event.action === TableActionsEnum.VIEW) {
      // Puedes implementar un modal de solo lectura si deseas
      this.openModal(event.row);
    }

    if (event.action === TableActionsEnum.DEACTIVATE) {
      this.nzModal.confirm({
        nzTitle: '¿Está seguro de desactivar este usuario?',
        nzContent: 'El usuario perderá acceso al sistema inmediatamente.',
        nzOkText: 'Sí, desactivar',
        nzOkDanger: true,
        nzOnOk: () => this.toggleUserStatus(event.row!.id, true)
      });
    }

    if (event.action === TableActionsEnum.ACTIVATE) {
      this.nzModal.confirm({
        nzTitle: '¿Desea reactivar este usuario?',
        nzContent: 'El usuario recuperará el acceso al sistema.',
        nzOkText: 'Sí, activar',
        nzOnOk: () => this.toggleUserStatus(event.row!.id, false)
      });
    }

    if (event.action === TableActionsEnum.REMOVE_IMAGE) {
      this.nzModal.confirm({
        nzTitle: '¿Eliminar avatar?',
        nzContent: 'Se quitará la imagen actual del usuario.',
        nzOkText: 'Sí, eliminar',
        nzOkDanger: true,
        nzOnOk: () =>
          new Promise((resolve, reject) => {
            this.userService.deleteAvatar(event.row!.id).subscribe({
              next: () => {
                this.notification.success('Avatar eliminado');
                this.refreshData();
                resolve(true);
              },
              error: (err) => {
                this.notification.error('Error al eliminar avatar');
                console.error(err);
                reject(err);
              }
            });
          })
      });
    }
  }

  private toggleUserStatus(id: string, currentStatus: boolean) {
    return new Promise((resolve, reject) => {
      this.userService.toggleUserStatus(id, currentStatus).subscribe({
        next: () => {
          this.notification.success(currentStatus ? 'Usuario desactivado' : 'Usuario activado');
          this.refreshData();
          resolve(true);
        },
        error: (err) => {
          this.notification.error('Error al cambiar estado del usuario');
          console.error(err);
          reject(err);
        }
      });
    });
  }

  onAddNewUser() {
    this.openModal();
  }

  private openModal(data?: IUser | null) {
    const modalRef = this.modalService.open(UserRegisterComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    if (data) {
      modalRef.componentInstance.userData = data;
    }

    modalRef.result.then((result) => {
      if (result) this.refreshData();
    }, () => {
      // Ignorar el cierre del modal (dismiss) sin realizar ninguna acción
    });
  }
  

}
