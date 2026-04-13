import { ColDef } from 'ag-grid-community';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { finalize, Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterLotesComponent } from './register-lotes.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectProjectsComponent } from "src/app/shared/components/atoms/select-projects.component";
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { ILote } from 'src/app/core/models/lote/lote.model';

@Component({
  selector: 'app-list-lotes',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DataTableComponent,
    SelectProjectsComponent, ReactiveFormsModule, NzModalModule],
  template: `
    <app-page-container
      title="Lotes - Urbanización"
      permissionScope="lotes"
      [showNew]="true"
      [showOptions]="true"
      (onAddNew)="onAddNewLote()">
      <div class="mb-3" style="max-width: 400px;">
        <app-select-projects
          [inputControl]="proyectoIdControl" 
          [placeholder]="'Seleccione el proyecto de destino...'">
        </app-select-projects>
      </div>
      <app-data-table
        [rowData]="(lotes$ | async) || []"
        [columnDefs]="columnDefs"
        [loading]="loading"
        height="350px"
        [showCreate]="false"
        [actions]="[tableActionEnum.VIEW, tableActionEnum.EDIT, tableActionEnum.DELETE]"
        (actionClicked)="onTableAction($event)">
      </app-data-table>
    </app-page-container>
  `,
  styles: ``
})
export class ListLotesComponent implements OnInit {
  public tableActionEnum = TableActionsEnum;
  public lotes$!: Observable<ILote[]>;
  public loading = false;
  public proyectoIdControl = new FormControl<string>('');

  columnDefs: ColDef[] = [
    { field: 'numero', headerName: 'Nro. Lote', filter: true, width: 150 },
    { field: 'manzanaId', headerName: 'Manzana ID', width: 150 },
    { field: 'areaM2', headerName: 'Sup. (m²)', sortable: true, width: 130 },
    { 
      field: 'precioReferencial', 
      headerName: 'Precio Ref. (Bs)',
      width: 150,
      valueFormatter: p => p.value ? `Bs. ${Number(p.value).toLocaleString()}` : 'Bs. 0'
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      cellStyle: (params) => {
        const styles: Record<string, string | number> = { fontWeight: 'bold' };
        if (params.value === 'DISPONIBLE') styles['color'] = '#10b981';
        if (params.value === 'VENDIDO') styles['color'] = '#ef4444';
        if (params.value === 'RESERVADO') styles['color'] = '#f59e0b';
        if (params.value === 'BLOQUEADO') styles['color'] = '#6b7280';
        return styles;
      }
    }
  ];

  constructor(
    private loteService: LoteService, 
    private modalService: NgbModal,
    private proyectoService: ProyectoService,
    private notification: NotificationService,
    private nzModal: NzModalService
  ) { }

  ngOnInit(): void {
    this.proyectoService.getProyectosLookup().subscribe(proyectos => {
      if (proyectos && proyectos.length > 0) {
        const firstId = proyectos[0].id;
        this.proyectoIdControl.setValue(firstId);
        this.refreshData(firstId);
      }
    });

    this.proyectoIdControl.valueChanges.subscribe(value => {
      if (value) this.refreshData(value);
    });
  }

  refreshData(id?: string | null): void {
    const idToSearch = id || this.proyectoIdControl.value;
    if (!idToSearch) return;

    this.loading = true;
    this.lotes$ = this.loteService.getLotesInmobiliarios(idToSearch).pipe(
      finalize(() => this.loading = false)
    );
  }

  onTableAction(event: ITableActionEvent<ILote>): void {
    if (event.action === TableActionsEnum.EDIT) {
      const modalRef = this.modalService.open(RegisterLotesComponent, { size: 'md' });
      modalRef.componentInstance.loteData = event.row;

      modalRef.result.then((result) => {
        if (result) this.refreshData();
      });
    } else if (event.action === TableActionsEnum.DELETE) {
      this.nzModal.confirm({
        nzTitle: '¿Está seguro de eliminar este lote?',
        nzContent: 'El lote cambiará su estado a "Eliminado" y no aparecerá en las ventas.',
        nzOkText: 'Confirmar',
        nzOkDanger: true,
        nzOnOk: () => new Promise((resolve, reject) => {
          this.loteService.deleteLote(event.row!.id).subscribe({
            next: () => {
              this.notification.success('Lote eliminado correctamente');
              this.refreshData();
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

  onAddNewLote(): void {
    const modalRef = this.modalService.open(RegisterLotesComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then((result) => {
      if (result) this.refreshData();
    }, () => {
        // Manejo de cierre sin acción (si es necesario)
    });
  }
}