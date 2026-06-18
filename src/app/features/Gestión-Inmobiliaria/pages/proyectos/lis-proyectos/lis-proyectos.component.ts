import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, finalize, take } from 'rxjs';
import { Router } from '@angular/router';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { EAppModule } from 'src/app/core/config/permissions.enum';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';
import { RegisterProyectoComponent } from '../register-proyecto/register-proyecto.component';
import { ProyectoDetailComponent } from '../proyecto-detail/proyecto-detail.component';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';

@Component({
  selector: 'app-lis-proyectos',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DataTableComponent, NzModalModule],
  template: `
    <app-page-container
      title="Urbanizaciónes"
      [permissionScope]="EAppModule.PROYECTOS"
      [showNew]="true"
      [showOptions]="true"
      (AddNew)="onAddNew()"
      (MenuExportPDF)="exportarPDF()"
      (MenuExportExcel)="exportarExcel()">
      <app-data-table
        [module]="EAppModule.PROYECTOS"
        [rowData]="(proyectos$ | async) || []"
        [columnDefs]="columnDefs"
        [loading]="loading"
        [showCreate]="false"
        [actions]="[tableActionEnum.VIEW, tableActionEnum.EDIT, 
          tableActionEnum.DELETE, tableActionEnum.MASS_LOAD,
          tableActionEnum.MANZANAS
        ]"
        (actionClicked)="onTableAction($event)">
      </app-data-table>
    </app-page-container>
  `,
  styles: ``
})
export class LisProyectosComponent implements OnInit {
  @ViewChild(DataTableComponent) private dataTable?: DataTableComponent<IProyecto>;

  public readonly EAppModule = EAppModule;
  public tableActionEnum = TableActionsEnum;
  public proyectos$!: Observable<IProyecto[]>;
  public loading = false;

  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  columnDefs: ColDef[] = [
    { field: 'nombre', headerName: 'Nombre del Proyecto', flex: 1.5, minWidth: 160 },
    { field: 'departamento', headerName: 'Departamento', width: 120, minWidth: 90 },
    { field: 'provincia', headerName: 'Provincia', width: 130, minWidth: 100 },
    { field: 'distrito', headerName: 'Distrito', width: 130, minWidth: 100 },
    { field: 'direccion', headerName: 'Dirección', flex: 2, minWidth: 200 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 100,
      minWidth: 90,
      cellRenderer: BadgeEstadoComponent
    }
  ];

  constructor(
    private proyectoService: ProyectoService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService,
    private router: Router,
    private globalContext: ProjectStatusGlobalService
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
    if (event.action === TableActionsEnum.MASS_LOAD) {
      this.router.navigate([`/gestion-inmobiliaria/proyecto/${event.row!.id}/carga-masiva`]);
    } else if (event.action === TableActionsEnum.EDIT) {
      this.openModal(event.row ?? undefined);
    } else if (event.action === TableActionsEnum.VIEW || event.action === TableActionsEnum.INFO) {
      this.openDetailModal(event.row!.id);
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
    } else if (event.action === TableActionsEnum.MANZANAS) {
      // Sincronizamos el selector global del navbar con el proyecto seleccionado
      this.globalContext.setSelectedProjectId(event.row!.id);
      this.router.navigate(['/gestion-inmobiliaria/manzanas']);
    }
  }

  onAddNew(): void {
    this.openModal();
  }

  public exportarPDF(): void {
    let dataToExport: IProyecto[] = [];
    if (this.dataTable?.gridApi) {
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) dataToExport.push(node.data);
      });
    }

    if (dataToExport.length > 0) {
      this.exportPdfService.exportAsPdf('Urbanizaciones', this.columnDefs, dataToExport);
    } else {
      this.proyectos$.pipe(take(1)).subscribe(data => {
        if (!data || data.length === 0) return;
        this.exportPdfService.exportAsPdf('Urbanizaciones', this.columnDefs, data);
      });
    }
  }

  public exportarExcel(): void {
    let dataToExport: IProyecto[] = [];
    if (this.dataTable?.gridApi) {
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) dataToExport.push(node.data);
      });
    }

    if (dataToExport.length > 0) {
      this.exportExcelService.exportAsExcel('Urbanizaciones', this.columnDefs, dataToExport);
    } else {
      this.proyectos$.pipe(take(1)).subscribe(data => {
        if (!data || data.length === 0) return;
        this.exportExcelService.exportAsExcel('Urbanizaciones', this.columnDefs, data);
      });
    }
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
    }).catch(() => {
      //
    });
  }

  private openDetailModal(proyectoId: string): void {
    const modalRef = this.modalService.open(ProyectoDetailComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.proyectoId = proyectoId;
  }
}
