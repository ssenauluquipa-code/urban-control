import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import {
  ITableActionEvent,
  TableActionsEnum,
} from 'src/app/shared/interfaces/table-actions.interface';
import {
  finalize,
  Observable,
  of,
} from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { ILote, TEstadoLote, UpdateEstadoLoteDto } from 'src/app/core/models/lote/lote.model';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { LoteVisualizerComponent } from '../../views/lote-visualizer/lote-visualizer.component';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer'; // Importar servicio
import { LoteDetailComponent } from '../../views/lotes/lote-detail/lote-detail.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { SelectManzanasComponent } from "src/app/shared/components/atoms/select-manzanas.component";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-lotes',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent,
    DataTableComponent,
    ReactiveFormsModule,
    FormsModule,
    NzModalModule,
    LoteVisualizerComponent,
    FormFieldComponent,
    NzDrawerModule,
    SelectManzanasComponent
  ],
  templateUrl: './list-lotes.component.html',
})
export class ListLotesComponent implements OnInit {
  public tableActionEnum = TableActionsEnum;
  public lotes$!: Observable<ILote[]>;
  public isLoading = false;

  public proyectoId: string | null = null;

  // Controles
  //public proyectoIdControl = new FormControl<string>('');
  public manzanaIdControl = new FormControl<string | null>({
    value: null,
    disabled: true,
  });



  public viewMode: 'table' | 'map' = 'table';
  columnDefs: ColDef[] = [
    {
      field: 'numero',
      headerName: 'Nro. Lote',
      width: 60,
      cellStyle: { fontWeight: 'bold' },
    },
    {
      field: 'areaM2',
      headerName: 'Área (m²)',
      width: 100,
      valueFormatter: (p) => (p.value ? p.value.toLocaleString('es-BO') : ''),
    },
    {
      field: 'precioReferencial',
      headerName: 'Precio Ref.',
      width: 120,
      valueFormatter: (p) =>
        p.value ? `Bs. ${p.value.toLocaleString('es-BO')}` : '',
    },
    {
      field: 'comision',
      headerName: 'Comisión',
      width: 70,
      valueFormatter: (p) => (p.value ? `${p.value}%` : ''),
    },
    {
      field: 'observaciones',
      headerName: 'Observaciones',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      cellRenderer: BadgeEstadoComponent
    },
  ];

  constructor(
    private loteService: LoteService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService,
    private drawerService: NzDrawerService,
    private breakpointObserver: BreakpointObserver,
    private globalContext: ProjectStatusGlobalService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1. Cargar primer proyecto
    this.globalContext.selectedProjectId$.subscribe((projectId) => {
      this.proyectoId = projectId;
      if (projectId) {
        this.manzanaIdControl.enable();
        this.manzanaIdControl.setValue(null);
      } else {
        this.manzanaIdControl.disable();
        this.manzanaIdControl.setValue(null);
        this.lotes$ = of([]);
      }
    });

    this.manzanaIdControl.valueChanges.subscribe((manzanaId) => {
      if (manzanaId) {
        this.loadLotes(manzanaId);
      } else {
        this.lotes$ = of([]);
      }
    });

  }

  private loadLotes(manzanaId: string): void {
    this.isLoading = true;
    this.lotes$ = this.loteService
      .getLotes(manzanaId)
      .pipe(finalize(() => this.isLoading = false));
  }



  public onLoteClick(lote: ILote): void {
    this.openDetailDrawer(lote.id);
  }

  onTableAction(event: ITableActionEvent<ILote>): void {
    //const manzanaId = this.manzanaIdControl.value;
    if (event.action === TableActionsEnum.EDIT) {
      this.router.navigate(['editar', event.row?.id], { relativeTo: this.route });
    }

    if (event.action === TableActionsEnum.BLOQUEADO) {
      this.confirmBloqueo(event.row!);
    }
    // Caso Poner Disponible (Desbloquear)
    if (event.action === TableActionsEnum.SET_AVAILABLE) {
      this.confirmDisponible(event.row!);
    }
  }

  onAddNewLote(): void {
    const manzanaId = this.manzanaIdControl.value;
    if (!manzanaId) {
      this.notification.warning('Seleccione una manzana primero.');
      return;
    }
    this.router.navigate(['crear'], {
      relativeTo: this.route,
      queryParams: { manzanaId: manzanaId }
    });
  }


  private confirmBloqueo(lote: ILote): void {
    this.nzModal.confirm({
      nzTitle: `¿Bloquear Lote #${lote.numero}?`,
      nzContent: 'El lote no estará disponible para ventas.',
      nzOkText: 'Sí, Bloquear',
      nzOkDanger: true,
      nzOnOk: () => {
        const payload: UpdateEstadoLoteDto = { estado: TEstadoLote.BLOQUEADO };
        this.executeStatusChange(lote.id, payload);
      }
    });
  }


  private confirmDisponible(lote: ILote): void {
    this.nzModal.confirm({
      nzTitle: `¿Poner Disponible Lote #${lote.numero}?`,
      nzContent: 'El lote volverá a estar disponible para ventas.',
      nzOkText: 'Sí, Disponible',
      nzOnOk: () => {
        const payload: UpdateEstadoLoteDto = { estado: TEstadoLote.DISPONIBLE };
        this.executeStatusChange(lote.id, payload);
      }
    });
  }

  private executeStatusChange(loteId: string, payload: UpdateEstadoLoteDto): void {
    this.loteService.updateEstadoLote(loteId, payload).subscribe({
      next: () => {
        this.notification.success(`Estado actualizado a ${payload.estado}`);
        if (this.manzanaIdControl.value) {
          this.loadLotes(this.manzanaIdControl.value);
        }
      },
      error: (err) => this.notification.error(err.error?.message || 'Error')
    });
  }
  public openDetailDrawer(loteId: string): void {
    const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);
    if (isMobile) {
      this.modalService.open(LoteDetailComponent, {
        size: 'fullscreen', // En móvil, mejor que ocupe todo
        scrollable: true,
        windowClass: 'terraform-modal-mobile',
      }).componentInstance.loteId = loteId;
    } else {
      this.drawerService.create({
        nzContent: LoteDetailComponent,
        nzTitle: '',
        nzClosable: false,
        nzMaskClosable: true,
        nzWidth: 450,
        nzData: {
          loteId: loteId,
        },
      });
    }
  }
}
