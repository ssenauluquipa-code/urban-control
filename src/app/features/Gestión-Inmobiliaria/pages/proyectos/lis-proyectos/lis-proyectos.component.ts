import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, finalize } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';
import { RegisterProyectoComponent } from '../register-proyecto/register-proyecto.component';

@Component({
  selector: 'app-lis-proyectos',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DataTableComponent, NzModalModule],
  template: `
    <app-page-container
      title="Proyectos de Urbanización"
      permissionScope="proyectos"
      [showNew]="true"
      (AddNew)="onAddNew()">
      <app-data-table
        [rowData]="(proyectos$ | async) || []"
        [columnDefs]="columnDefs"
        [loading]="loading"        
        [showCreate]="false"
        [actions]="[tableActionEnum.VIEW, tableActionEnum.EDIT, tableActionEnum.DELETE]"
        (actionClicked)="onTableAction($event)">
      </app-data-table>
    </app-page-container>
  `,
  styles: ``
})
export class LisProyectosComponent implements OnInit {
  public tableActionEnum = TableActionsEnum;
  public proyectos$!: Observable<IProyecto[]>;
  public loading = false;

  columnDefs: ColDef[] = [
    { field: 'nombre', headerName: 'Nombre del Proyecto', flex: 1, width: 200 },
    { field: 'departamento', headerName: 'Departamento', width: 150 },
    { field: 'provincia', headerName: 'Provincia', width: 150 },
    { field: 'distrito', headerName: 'Distrito', flex: 1, width: 150 },
    { field: 'direccion', headerName: 'Dirección', width: 250 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      cellRenderer: BadgeEstadoComponent
    },
    {
      field: 'createdAt',
      headerName: 'Fecha Creación',
      width: 150,
      valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString('es-ES') : ''
    }
  ];

  constructor(
    private proyectoService: ProyectoService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.proyectos$ = this.proyectoService.getProyectos().pipe(
      finalize(() => this.loading = false)
    );
  }

  onTableAction(event: ITableActionEvent<IProyecto>): void {
    if (event.action === TableActionsEnum.EDIT) {
      this.openModal(event.row ?? undefined);
    } else if (event.action === TableActionsEnum.DELETE) {
      this.nzModal.confirm({
        nzTitle: '¿Está seguro de eliminar este proyecto?',
        nzContent: 'Esta acción no se puede deshacer.',
        nzOkText: 'Confirmar',
        nzOkDanger: true,
        nzOnOk: () => new Promise((resolve, reject) => {
          this.proyectoService.deleteProyecto(event.row!.id).subscribe({
            next: () => {
              this.notification.success('Proyecto eliminado correctamente');
              this.loadData();
              resolve(true);
            },
            error: (err) => {
              this.notification.error('Error al eliminar el proyecto');
              reject(err);
            }
          });
        })
      });
    }
  }

  onAddNew(): void {
    this.openModal();
  }

  private openModal(proyecto?: IProyecto): void {
    const modalRef = this.modalService.open(RegisterProyectoComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    if (proyecto) {
      modalRef.componentInstance.proyectoData = proyecto;
    }

    modalRef.result.then((result) => {
      if (result) this.loadData();
    });
  }
}