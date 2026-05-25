import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import {
  ITableActionEvent,
  TableActionsEnum,
} from 'src/app/shared/interfaces/table-actions.interface';
import { EAppModule } from 'src/app/core/config/permissions.enum';
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
import { ILote } from 'src/app/core/models/lote/lote.model';
import { ConfirmationService } from 'src/app/core/services/confirmation.service';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
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
    FormFieldComponent,
    NzDrawerModule,
    SelectManzanasComponent
  ],
  templateUrl: './list-lotes.component.html',
})
export class ListLotesComponent implements OnInit {
  public readonly EAppModule = EAppModule;
  public tableActionEnum = TableActionsEnum;
  public lotes = signal<ILote[]>([]);
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
      width: 100,
      cellStyle: { fontWeight: 'bold' },
    },
    {
      field: 'manzana.codigo',
      headerName: 'Manzana',
      width: 100,
    },
    {
      field: 'areaM2',
      headerName: 'Área (m²)',
      width: 110,
      valueFormatter: (p) => (p.value ? p.value.toLocaleString('es-BO') : ''),
    },
    {
      field: 'precioReferencial',
      headerName: 'Precio (Bs.)',
      width: 120,
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
      width: 130,
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
    private route: ActivatedRoute,
    private confirmation: ConfirmationService
  ) {
    effect(() => {
      const projectId : string | null = this.globalContext.currentProjectId();
      this.proyectoId = projectId;
      if (projectId) {
        this.manzanaIdControl.enable({ emitEvent: false });
        this.manzanaIdControl.setValue(null, { emitEvent: false });
        // Cargamos todos los lotes de la base de datos para el proyecto seleccionado
        this.loadLotes(null);
      } else {
        this.manzanaIdControl.disable({ emitEvent: false });
        this.manzanaIdControl.setValue(null, { emitEvent: false });
        this.lotes.set([]);
      }
    })
   }

  ngOnInit(): void {
    // 1. Cargar primer proyecto
    /* ssss */

    this.manzanaIdControl.valueChanges.subscribe((manzanaId) => {
      // Si hay manzanaId, filtra; si no, carga todos
      this.loadLotes(manzanaId);
    });

  }

  private loadLotes(manzanaId: string | null): void {
    this.isLoading = true;
    this.loteService
      .getLotes(manzanaId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data: ILote[]) => {
          this.lotes.set(data);
        },
        error : () => {
          this.notification.error('Error al recuperar el listado de lotes');
          this.lotes.set([]);
        }
      });
  }



  public onLoteClick(lote: ILote): void {
    this.openDetailDrawer(lote.id);
  }

  onTableAction(event: ITableActionEvent<ILote>): void {
    //const manzanaId = this.manzanaIdControl.value;
    if (event.action === TableActionsEnum.EDIT) {
      this.router.navigate(['editar', event.row?.id], { relativeTo: this.route });
    } else if (event.action === TableActionsEnum.VIEW) {
      this.openDetailDrawer(event.row!.id);
    } else if (event.action === TableActionsEnum.DELETE && event.row?.estado === 'DISPONIBLE') {
      this.confirmarEliminar(event.row);
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


  private confirmarEliminar(lote: ILote): void {
    if (lote.estado !== 'DISPONIBLE') {
      this.notification.warning('Solo se pueden eliminar lotes que se encuentren disponibles.');
      return;
    }
    const request$ = this.loteService.deleteLote(lote.id);
    this.confirmation.confirmDelete('Lote', `#${lote.numero}`, request$, false) // false porque es masculino (este lote, eliminado)
      .subscribe(success => {
        if (success) {
          this.loadLotes(this.manzanaIdControl.value);
        }
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
