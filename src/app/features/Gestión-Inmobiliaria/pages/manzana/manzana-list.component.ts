import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef } from 'ag-grid-community';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize, Observable, of } from 'rxjs';
import { IManzana } from 'src/app/core/models/manzana/manzana.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { RegisterManzanaComponent } from './register-manzana.component';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { SelectProjectsComponent } from "src/app/shared/components/atoms/select-projects.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';

@Component({
  selector: 'app-manzana-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageContainerComponent, SelectProjectsComponent, DataTableComponent, NzModalModule],
  template: `
    <app-page-container
      title="Gestión de Manzanas"
      permissionScope="manzanas"
      [showNew]="true"
      [showOptions]="true"
      (AddNew)="onAddNewManzana()">

      <app-data-table
        [rowData]="(manzanas$ | async) || []"
        [columnDefs]="columnDefs"
        [loading]="isLoading"
        height="350px"
        [showCreate]="false"
        [actions]="[tableActionEnum.EDIT, tableActionEnum.DELETE]"
        (actionClicked)="onTableAction($event)">
      </app-data-table>

    </app-page-container>
  `,
  styles: ``
})
export class ManzanaListComponent implements OnInit {

  public tableActionEnum = TableActionsEnum;
  public manzanas$!: Observable<IManzana[]>;
  public isLoading = false;

  constructor(private manzanaService: ManzanaService,
    private proyectoService: ProyectoService, // Para cargar el primero por defecto
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService,
    private globalContext: ProjectStatusGlobalService
  ) { }

  columnDefs: ColDef[] = [
    {
      field: 'codigo',
      headerName: 'Código Manzana',
      width: 150,
      filter: true,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      flex: 1,
      minWidth: 200
    },
  ];

  ngOnInit(): void {
    this.globalContext.selectedProjectId$.subscribe(projectId => {
      if (projectId) {
        this.refreshData(projectId);
      } else {
        this.manzanas$ = of([]);
      }
    })
  }

  refreshData(proyectoId: string): void {
    this.isLoading = true;
    this.manzanas$ = this.manzanaService.getManzanas(proyectoId).pipe(
      finalize(() => this.isLoading = false)
    );
  }

  onTableAction(event: ITableActionEvent<IManzana>): void {
    const proyectoId = this.globalContext.getCurrentProjectId();
    if (!proyectoId) return;

    if (event.action === TableActionsEnum.EDIT) {
      this.openModal(event.row, proyectoId);
    }

    if (event.action === TableActionsEnum.DELETE) {
      this.confirmDelete(event.row as IManzana);
    }
  }

  onAddNewManzana(): void {
    const proyectoId = this.globalContext.getCurrentProjectId();
    if (!proyectoId) {
      this.notification.warning('Seleccione un proyecto primero.');
      return;
    }
    this.openModal(null, proyectoId);
  }

  private openModal(data: IManzana | null, proyectoId: string): void {
    const modalRef = this.modalService.open(RegisterManzanaComponent, { size: 'md' });

    modalRef.componentInstance.proyectoId = proyectoId; // Siempre pasamos el contexto
    if (data) {
      modalRef.componentInstance.manzanaData = data;
    }

    modalRef.result.then((result) => {
      if (result) this.refreshData(proyectoId);
    });
  }

  private confirmDelete(manzana: IManzana): void {
    this.nzModal.confirm({
      nzTitle: `¿Eliminar Manzana ${manzana.codigo}?`,
      nzContent: 'Se eliminarán todos los lotes asociados a esta manzana. Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          this.manzanaService.deleteManzana(manzana.id).subscribe({
            next: () => {
              this.notification.success('Manzana eliminada');
              // Recargamos usando el ID actual del selector
              const currentId = this.globalContext.getCurrentProjectId();
              if (currentId) this.refreshData(currentId);
              resolve(true);
            },
            error: (err) => {
              this.notification.error('Error al eliminar');
              reject(err);
            }
          });
        })
    });
  }


}
