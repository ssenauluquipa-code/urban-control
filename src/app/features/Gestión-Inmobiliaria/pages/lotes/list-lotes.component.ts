import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { finalize, Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectProjectsComponent } from "src/app/shared/components/atoms/select-projects.component";
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { ILote } from 'src/app/core/models/lote/lote.model';
import { RegisterLotesComponent } from './register-lotes.component';
import { IManzana } from 'src/app/core/models/manzana/manzana.model';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-list-lotes',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DataTableComponent,
    SelectProjectsComponent, ReactiveFormsModule, FormsModule, NzModalModule, NzSelectModule],
  template: `
    
    <app-page-container
      title="Gestión de Lotes"
      permissionScope="lotes"
      [showNew]="true"
      [showOptions]="true"
      (onAddNew)="onAddNewLote()">

      <!-- Filtros en Cascada -->
      <div class="row mb-3">
        <div class="col-md-4">
          <label class="form-label-small" for="proyecto-select">Proyecto</label>
          <app-select-projects
            id="proyecto-select"
            [inputControl]="proyectoIdControl"
            [placeholder]="'Seleccione proyecto...'">
          </app-select-projects>
        </div>
        <div class="col-md-4">
          <label class="form-label-small" for="manzana-select">Manzana</label>
          <nz-select
            nzId="manzana-select"
            class="w-100"
            [ngModel]="manzanaIdControl.value"
            (ngModelChange)="onManzanaChange($event)"
            [nzPlaceHolder]="'Seleccione manzana'"
            [nzDisabled]="!proyectoIdControl.value">
              @for (manzana of manzanasList$ | async; track manzana.id) {
                <nz-option [nzValue]="manzana.id" [nzLabel]="manzana.codigo"></nz-option>
              }
          </nz-select>
        </div>
      </div>
            <app-data-table
        [rowData]="(lotes$ | async) || []"
        [columnDefs]="columnDefs"
        [loading]="isLoading"
        height="350px"
        [showCreate]="false"
        [actions]="[tableActionEnum.EDIT, tableActionEnum.DELETE]"
        (actionClicked)="onTableAction($event)">
      </app-data-table>

    </app-page-container>

  `,
  styles: `
  .form-label-small {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 4px;
      text-transform: uppercase;
    }
  `
})
export class ListLotesComponent implements OnInit {
  public tableActionEnum = TableActionsEnum;
  public lotes$!: Observable<ILote[]>;
  public manzanasList$!: Observable<IManzana[]>;
  public isLoading = false;

  // Controles
  public proyectoIdControl = new FormControl<string>('');
  public manzanaIdControl = new FormControl<string>('');

  columnDefs: ColDef[] = [
    {
      field: 'numero',
      headerName: 'Nro. Lote',
      width: 100,
      filter: true,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'areaM2',
      headerName: 'Área (m²)',
      width: 120,
      valueFormatter: (p) => p.value ? p.value.toLocaleString('es-BO') : ''
    },
    {
      field: 'precioReferencial',
      headerName: 'Precio Ref.',
      width: 140,
      valueFormatter: (p) => p.value ? `Bs. ${p.value.toLocaleString('es-BO')}` : ''
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
          case 'DISPONIBLE':
            color = '#059669'; bg = '#d1fae5'; break; // Verde
          case 'RESERVADO':
            color = '#d97706'; bg = '#fef3c7'; break; // Naranja
          case 'VENDIDO':
            color = '#dc2626'; bg = '#fee2e2'; break; // Rojo
          case 'BLOQUEADO':
            color = '#4b5563'; bg = '#e5e7eb'; break; // Gris oscuro
        }

        return `<span style="background-color: ${bg}; color: ${color}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${estado}</span>`;
      }
    },
    {
      field: 'comision',
      headerName: 'Comisión',
      width: 100,
      valueFormatter: (p) => p.value ? `${p.value}%` : ''
    }
  ];

  constructor(
    private loteService: LoteService,
    private manzanaService: ManzanaService,
    private proyectoService: ProyectoService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService
  ) { }

  ngOnInit(): void {
    // 1. Cargar primer proyecto por defecto
    this.proyectoService.getProyectos().subscribe(proyectos => {
      if (proyectos.length > 0) {
        this.proyectoIdControl.setValue(proyectos[0].id);
      }
    });

    // 2. Escuchar cambios en PROYECTO -> Cargar Manzanas
    this.proyectoIdControl.valueChanges.subscribe(proyectoId => {
      if (proyectoId) {
        this.manzanasList$ = this.manzanaService.getManzanas(proyectoId);
        // Reseteamos la manzana seleccionada al cambiar de proyecto
        this.manzanaIdControl.setValue(null);
      }
    });
  }

  // 3. Escuchar cambios en MANZANA -> Cargar Lotes
  onManzanaChange(manzanaId: string): void {
    this.manzanaIdControl.setValue(manzanaId);

    if (manzanaId) {
      this.isLoading = true;
      this.lotes$ = this.loteService.getLotes(manzanaId).pipe(
        finalize(() => this.isLoading = false)
      );
    } else {
      this.lotes$ = of([]);
    }
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
    const modalRef = this.modalService.open(RegisterLotesComponent, { size: 'lg' });

    modalRef.componentInstance.manzanaId = manzanaId;
    if (data) {
      modalRef.componentInstance.loteData = data;
    }

    modalRef.result.then((result) => {
      if (result && this.manzanaIdControl.value) {
        this.onManzanaChange(this.manzanaIdControl.value); // Refrescar
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
              if (this.manzanaIdControl.value) this.onManzanaChange(this.manzanaIdControl.value);
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