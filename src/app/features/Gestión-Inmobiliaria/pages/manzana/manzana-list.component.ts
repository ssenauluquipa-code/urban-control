import { Component, effect, OnInit, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ColDef } from 'ag-grid-community';
import { NzModalService } from 'ng-zorro-antd/modal';
import { finalize, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { IManzana } from 'src/app/core/models/manzana/manzana.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { inject } from '@angular/core';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { EAppModule } from 'src/app/core/config/permissions.enum';
import { RegisterManzanaComponent } from './register-manzana.component';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';

@Component({
  selector: 'app-manzana-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageContainerComponent, DataTableComponent, NzModalModule],
  template: `
    <app-page-container
      title="Gestión de Manzanas"
      [permissionScope]="EAppModule.MANZANAS"
      [showNew]="true"
      [showOptions]="true"
      (AddNew)="onAddNewManzana()"
      (MenuExportPDF)="exportarPDF()"
      (MenuExportExcel)="exportarExcel()">

      <app-data-table
        [module]="EAppModule.MANZANAS"
        [rowData]="manzanas()"
        [columnDefs]="columnDefs"
        [loading]="isLoading"
        [showCreate]="false"
        [actions]="[tableActionEnum.EDIT, tableActionEnum.DELETE, 
          tableActionEnum.LOTES]"
        (actionClicked)="onTableAction($event)">
      </app-data-table>

    </app-page-container>
  `,
  styles: ``
})
export class ManzanaListComponent implements OnInit {
  @ViewChild(DataTableComponent) private dataTable?: DataTableComponent<IManzana>;

  public readonly EAppModule = EAppModule;
  public tableActionEnum = TableActionsEnum;
  //Guardamos los datos en un Signal local en vez de usar un Observable suelto ($)
  public manzanas = signal<IManzana[]>([]);
  public isLoading = false;

  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  constructor(private manzanaService: ManzanaService,
    private proyectoService: ProyectoService, // Para cargar el primero por defecto
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService,
    private globalContext: ProjectStatusGlobalService,
    private router: Router
  ) { 
    effect(() => {
      const projectId = this.globalContext.currentProjectId();
      if(projectId){
        this.refreshData(projectId);
      }else{
        this.manzanas.set([]);
      }
    })
  }

  columnDefs: ColDef[] = [
    {
      field: 'codigo',
      headerName: 'Código Manzana',
      width: 130,
      minWidth: 100,
      filter: true,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'descripcion',
      headerName: 'Descripción',
      flex: 1,
      minWidth: 200
    },
    {
      field : '_count.lotes',
      headerName: 'Lotes',      
      width: 90,
      minWidth: 80,
      cellStyle: { fontWeight: 'bold' }
    }
  ];

  ngOnInit(): void {
    
  }

  refreshData(proyectoId: string): void {
    this.isLoading = true;
    this.manzanaService.getManzanas()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.manzanas.set(data); // 🔄 Seteamos el valor de forma reactiva en el Signal
        },
        error: () => {
          this.notification.error('Error al cargar la lista de manzanas.');
          this.manzanas.set([]);
        }
      });
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

    if (event.action === TableActionsEnum.LOTES) {
      // Navegamos a la lista de lotes pre-filtrando por la manzana seleccionada
      this.router.navigate(['/gestion-inmobiliaria/lotes'], {
        queryParams: { manzanaId: event.row!.id }
      });
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

  public exportarPDF(): void {
    let dataToExport = this.manzanas();
    if (this.dataTable?.gridApi) {
      const filtered: IManzana[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportPdfService.exportAsPdf('Gestión de Manzanas', this.columnDefs, dataToExport);
  }

  public exportarExcel(): void {
    let dataToExport = this.manzanas();
    if (this.dataTable?.gridApi) {
      const filtered: IManzana[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportExcelService.exportAsExcel('Gestión de Manzanas', this.columnDefs, dataToExport);
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
