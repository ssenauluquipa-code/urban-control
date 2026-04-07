import { ColDef } from 'ag-grid-community';
import { Component, OnInit } from '@angular/core';
import { ILote } from 'src/app/core/models/gestion-inmobiliaria/lotes.model';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { finalize, Observable } from 'rxjs';
import { LoteService } from 'src/app/core/services/gestion-inmobiliaria/lote.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterLotesComponent } from './register-lotes.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectProjectsComponent } from "src/app/shared/components/atoms/select-projects.component";
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
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
          [loading]="false"
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
  public loteFormGroup!: FormGroup;
  public proyectoIdControl = new FormControl<string>('');
  // Definición de columnas según tu diseño y backend
  columnDefs: ColDef[] = [
    { field: 'numeroLote', headerName: 'Nro. Lote', filter: true, width: 150 },
    { field: 'manzana', headerName: 'Manzana', width: 120, valueFormatter: p => `Mzn ${p.value}` },
    { field: 'superficieM2', headerName: 'Sup. (m²)', sortable: true, width: 130 },
    {
      headerName: 'Precio (Bs)',
      width: 150,
      valueGetter: (p) => {
        if (p.data && p.data.superficieM2 && p.data.proyecto?.precioBaseM2) {
          return p.data.superficieM2 * p.data.proyecto.precioBaseM2;
        }
        return 0;
      },
      valueFormatter: p => `Bs. ${p.value ? p.value.toLocaleString() : '0'}`
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      cellStyle: (params) => {
        const styles: Record<string, string | number> = { fontWeight: 'bold' };
        if (params.value === 'Disponible') styles['color'] = '#10b981';
        if (params.value === 'Vendido') styles['color'] = '#ef4444';
        if (params.value === 'Reservado') styles['color'] = '#f59e0b';
        return styles;
      }
    }
  ];

  constructor(private loteService: LoteService, private modalService: NgbModal,
    private proyectoService: ProyectoService,private notification: NotificationService,
    private nzModal: NzModalService
  ) { }

  ngOnInit(): void {
    // 1. Cargar el primer proyecto automáticamente al iniciar
    this.proyectoService.getProyectosLookup().subscribe(proyectos => {
      if (proyectos && proyectos.length > 0) {
        // Tomamos el ID del primer proyecto (asegúrate si es .id o .Id)
        const firstId = proyectos[0].id || proyectos[0].id;
        this.proyectoIdControl.setValue(firstId);
        this.refreshData(firstId);
      }
    });

    // 2. Mantener el listener para cambios manuales
    this.proyectoIdControl.valueChanges.subscribe(value => {
      if (value) this.refreshData(value);
    });
  }

  refreshData(id?: string | null) {
    const idToSearch = id || this.proyectoIdControl.value;
    if (!idToSearch) return;

    this.loading = true;
    this.lotes$ = this.loteService.getLotesInmobiliarios(idToSearch).pipe(
      finalize(() => this.loading = false)
    );
  }

  onTableAction(event: ITableActionEvent<ILote>) {
    console.log(`Acción: ${event.action} para el lote:`, event.row);

    if (event.action === TableActionsEnum.EDIT) {
      const modalRef = this.modalService.open(RegisterLotesComponent, { size: 'md' });
      // Pasamos el objeto del lote al componente del modal
      modalRef.componentInstance.loteData = event.row;

      modalRef.result.then((result) => {
        if (result) this.refreshData(); // Recargar tabla tras editar
      });
    }
    if (event.action === TableActionsEnum.DELETE) {
  this.nzModal.confirm({
    nzTitle: '¿Está seguro de eliminar este lote?',
    nzContent: 'El lote cambiará su estado a "Eliminado" y no aparecerá en las ventas.',
    nzOkText: 'Confirmar',
    nzOkDanger: true,
    // nzOnOk puede retornar una Promesa o un Observable para mostrar el cargando en el botón
    nzOnOk: () => 
      new Promise((resolve, reject) => {
        this.loteService.softDeleteLote(event.row!.id).subscribe({
          next: () => {
            this.notification.success('Lote eliminado correctamente');
            this.refreshData();
            resolve(true); // Cierra el modal
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

  onAddNewLote() {
    this.openModal();
  }

  private openModal(data?: ILote) {
    const modalRef = this.modalService.open(RegisterLotesComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false
    });

    if (data) {
      modalRef.componentInstance.loteData = data;
    }

    modalRef.result.then((result) => {
      if (result) {
        this.refreshData(); // Recarga la AG-Grid
      }
    }, () => {
      // Ignorar el cierre del modal (dismiss) sin realizar ninguna acción
    });
  }

  get proyectoId() { return this.loteFormGroup.get('proyectoId') as FormControl<string>; }

}
