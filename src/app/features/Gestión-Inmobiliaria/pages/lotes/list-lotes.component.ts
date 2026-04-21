import { ColDef, ICellRendererParams } from 'ag-grid-community';
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
import { ILote, TEstadoLote } from 'src/app/core/models/lote/lote.model';
import { RegisterLotesComponent } from './register-lotes.component';
import { IManzana } from 'src/app/core/models/manzana/manzana.model';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';

import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { LoteVisualizerComponent } from '../../views/lote-visualizer/lote-visualizer.component';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer'; // Importar servicio
import { LoteDetailComponent } from '../../views/lotes/lote-detail/lote-detail.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';

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
    SelectDataComponent,
    LoteVisualizerComponent,
    FormFieldComponent,
    NzDrawerModule,
  ],
  template: `
    <app-page-container
      title="Gestión de Lotes"
      permissionScope="lotes"
      [showNew]="true"
      [showOptions]="true"
      (AddNew)="onAddNewLote()"
    >
      <!-- 📌 FILTROS + BOTONES EN UNA SOLA FILA -->
      <div class="row mb-3 g-2">

        <!-- Columna 1: Manzana (col-md-3) -->
        <div class="col-md-3 col-sm-6">
          <app-form-field label="Manzana">
            <app-select-data
              [inputControl]="manzanaIdControl"
              [itemList]="(manzanasList$ | async) || []"
              [bindValue]="'id'"
              [bindLabel]="'codigo'"
              [placeholder]="'Seleccione manzana'"
            >
            </app-select-data>
          </app-form-field>
        </div>

        <!-- Columna 3: Botones de Vista (Estandarizados) -->
        <div class="col-md-6 col-sm-12">
          <app-form-field label="Vista">
            <div class="btn-group w-100" role="group">
              <button
                type="button"
                class="btn btn-md flex-fill"
                [class.btn-primary]="viewMode === 'table'"
                [class.btn-outline-secondary]="viewMode !== 'table'"
                (click)="viewMode = 'table'"
                title="Vista de lista"
              >
                <i class="bi bi-table me-2"></i> Lista
              </button>
              <button
                type="button"
                class="btn btn-md flex-fill"
                [class.btn-primary]="viewMode === 'map'"
                [class.btn-outline-secondary]="viewMode !== 'map'"
                (click)="viewMode = 'map'"
                title="Vista de plano"
              >
                <i class="bi bi-map me-2"></i> Plano
              </button>
            </div>
          </app-form-field>
        </div>
      </div>

      <!-- 🆕 VISTA MAPA / PLANO -->
      @if (viewMode === 'map') {
        <app-lote-visualizer
          [lotes]="(lotes$ | async) || []"
          (loteClick)="onLoteClick($event)"
        >
        </app-lote-visualizer>
      }

      <!-- VISTA TABLA -->
      @if (viewMode === 'table') {
        <app-data-table
          [rowData]="(lotes$ | async) || []"
          [columnDefs]="columnDefs"
          [loading]="isLoading"
          [showCreate]="false"
          [actions]="[tableActionEnum.EDIT, tableActionEnum.DELETE]"
          (actionClicked)="onTableAction($event)"
          (rowClicked)="openDetailDrawer($event.id)"
        >
        </app-data-table>
      }
    </app-page-container>
  `,
  styles: ``,
})
export class ListLotesComponent implements OnInit {
  public tableActionEnum = TableActionsEnum;
  public lotes$!: Observable<ILote[]>;
  public manzanasList$!: Observable<IManzana[]>;
  public isLoading = false;

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
      filter: true,
      cellStyle: { fontWeight: 'bold' },
    },
    {
      field: 'areaM2',
      headerName: 'Área (m²)',
      width: 120,
      valueFormatter: (p) => (p.value ? p.value.toLocaleString('es-BO') : ''),
    },
    {
      field: 'precioReferencial',
      headerName: 'Precio Ref.',
      width: 140,
      valueFormatter: (p) =>
        p.value ? `Bs. ${p.value.toLocaleString('es-BO')}` : '',
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      cellRenderer: (params: ICellRendererParams) => {
        const estado = params.value;
        let color = '#64748b'; // Gris por defecto
        let bg = '#f1f5f9';

        switch (estado) {
          case TEstadoLote.DISPONIBLE:
            color = '#059669';
            bg = '#d1fae5';
            break; // Verde
          case TEstadoLote.RESERVADO:
            color = '#d97706';
            bg = '#fef3c7';
            break; // Naranja
          case TEstadoLote.VENDIDO:
            color = '#dc2626';
            bg = '#fee2e2';
            break; // Rojo
          case TEstadoLote.BLOQUEADO:
            color = '#4b5563';
            bg = '#e5e7eb';
            break; // Gris oscuro
        }

        return `<span style="background-color: ${bg}; color: ${color}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${estado}</span>`;
      },
    },
    {
      field: 'comision',
      headerName: 'Comisión',
      width: 100,
      valueFormatter: (p) => (p.value ? `${p.value}%` : ''),
    },
  ];

  constructor(
    private loteService: LoteService,
    private manzanaService: ManzanaService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService,
    private drawerService: NzDrawerService,
    private breakpointObserver: BreakpointObserver,
    private globalContext: ProjectStatusGlobalService,
  ) { }

  ngOnInit(): void {
    // 1. Cargar primer proyecto
    this.globalContext.selectedProjectId$.subscribe((projectId) => {
      if (projectId) {
        this.manzanasList$ = this.manzanaService.getManzanas(projectId);
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



  // 🚀 Método para cambio de estado rápido
  private cambiarEstadoRapido(lote: ILote): void {
    // Lógica simple para ciclar estados.
    // En una app real, aquí podría abrirse un mini-menú contextual.
    const estados: TEstadoLote[] = Object.values(TEstadoLote);
    const currentIndex = estados.indexOf(lote.estado);
    const nextIndex = (currentIndex + 1) % estados.length;
    const nuevoEstado = estados[nextIndex];

    this.loteService
      .updateEstadoLote(lote.id, { estado: nuevoEstado })
      .subscribe({
        next: () => {
          this.notification.success(`Estado cambiado a ${nuevoEstado}`);
          // Refrescar lista actual
          const currentManzana = this.manzanaIdControl.value;
          this.loadLotes(currentManzana!);
        },
        error: () => this.notification.error('No se pudo cambiar el estado'),
      });
  }

  public onLoteClick(lote: ILote): void {
    this.openDetailDrawer(lote.id);
  }

  onTableAction(event: ITableActionEvent<ILote>): void {
    const manzanaId = this.manzanaIdControl.value;

    if (event.action === TableActionsEnum.EDIT) {
      this.openModal(event.row, manzanaId!);
    }

    if (event.action === TableActionsEnum.DELETE) {
      this.confirmDelete(event.row!);
    }
  }

  onAddNewLote(): void {
    const manzanaId = this.manzanaIdControl.value;
    if (!manzanaId) {
      this.notification.warning('Seleccione una manzana primero.');
      return;
    }
    this.openModal(null, manzanaId);
  }

  private openModal(data: ILote | null, manzanaId: string): void {
    const modalRef = this.modalService.open(RegisterLotesComponent, {
      size: 'lg',
    });

    modalRef.componentInstance.manzanaId = manzanaId;
    if (data) {
      modalRef.componentInstance.loteData = data;
    }

    modalRef.result.then((result) => {
      if (result && this.manzanaIdControl.value) {
        this.loadLotes(this.manzanaIdControl.value);
      }
    });
  }

  private confirmDelete(lote: ILote): void {
    this.nzModal.confirm({
      nzTitle: `¿Eliminar Lote #${lote.numero}?`,
      nzContent: 'Esta acción no se puede deshacer.',
      nzOkText: 'Eliminar',
      nzOkDanger: true,
      nzOnOk: () =>
        new Promise((resolve, reject) => {
          this.loteService.deleteLote(lote.id).subscribe({
            next: () => {
              this.notification.success('Lote eliminado');
              if (this.manzanaIdControl.value)
                this.loadLotes(this.manzanaIdControl.value);
              resolve(true);
            },
            error: (err) => {
              this.notification.error('Error al eliminar');
              reject(err);
            },
          });
        }),
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
