import { ColDef, ICellRendererParams } from 'ag-grid-community';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { debounceTime, distinctUntilChanged, finalize, Observable, of } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectProjectsComponent } from "src/app/shared/components/atoms/select-projects.component";
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { ILote, TEstadoLote } from 'src/app/core/models/lote/lote.model';
import { RegisterLotesComponent } from './register-lotes.component';
import { IManzana } from 'src/app/core/models/manzana/manzana.model';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { LoteVisualizerComponent } from "../../views/lote-visualizer/lote-visualizer.component";
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer'; // Importar servicio
import { LoteDetailComponent } from '../../views/lotes/lote-detail/lote-detail.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-list-lotes',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DataTableComponent,
    SelectProjectsComponent, ReactiveFormsModule, FormsModule,
    NzModalModule, SelectDataComponent, LoteVisualizerComponent,
    InputTextComponent, FormFieldComponent, NzDrawerModule],
  template: `
    
    <app-page-container
  title="Gestión de Lotes"
  permissionScope="lotes"
  [showNew]="true"
  [showOptions]="true"
  (AddNew)="onAddNewLote()">

  <!-- Filtros en Cascada -->
  <div class="row mb-3 flex">
    <div class="col-md-4">
      <app-form-field label="Proyecto" forId="proyecto-select"
      >
        <app-select-projects
          id="proyecto-select"
          [inputControl]="proyectoIdControl"
          [placeholder]="'Seleccione proyecto...'">
        </app-select-projects>
      </app-form-field>
    </div>
    <div class="col-md-4">
      <app-form-field label="Manzana">
        <app-select-data
          [inputControl]="manzanaIdControl"
          [itemList]="(manzanasList$ | async) || []"
          [bindValue]="'id'"
          [bindLabel]="'codigo'"
          [placeholder]="'Seleccione manzana'">
        </app-select-data>
      </app-form-field>
    </div>

    <!-- 🔍 Buscador -->
    <div class="col-md-4">
      <app-form-field label="Buscar Lote" forId="search-lote-id">
        <app-input-text
          inputId="search-lote-id"
          [input_control]="searchControl"
          input_placeholder="Escriba el número..."
          prefix_icon="search">
        </app-input-text>
      </app-form-field>
    </div>
  </div>

  <!-- 🆕 BOTONES DE VISTA -->
  <div class="btn-group mb-3" role="group" aria-label="Cambiar vista">
    <button
      type="button"
      class="btn"
      [class.btn-primary]="viewMode === 'table'"
      [class.btn-outline-secondary]="viewMode !== 'table'"
      (click)="viewMode = 'table'">
      <i class="bi bi-table me-1"></i> Lista
    </button>
    <button
      type="button"
      class="btn"
      [class.btn-primary]="viewMode === 'map'"
      [class.btn-outline-secondary]="viewMode !== 'map'"
      (click)="viewMode = 'map'">
      <i class="bi bi-map me-1"></i> Plano
    </button>
  </div>

  <!-- 🆕 VISTA MAPA / PLANO -->
  @if (viewMode === 'map') {
    <app-lote-visualizer
      [lotes]="(lotes$ | async) || []"
      (loteClick)="onLoteClick($event)">
    </app-lote-visualizer>
  }

  <!-- VISTA TABLA -->
  @if (viewMode === 'table') {
    <app-data-table
      [rowData]="(lotes$ | async) || []"
      [columnDefs]="columnDefs"
      [loading]="isLoading"
      height="350px"
      [showCreate]="false"
      [actions]="[tableActionEnum.EDIT, tableActionEnum.DELETE]"
      (actionClicked)="onTableAction($event)"
      (rowClicked)="openDetailDrawer($event.id)"
      >
    </app-data-table>
  }

</app-page-container>

  `,
  styles: ``
})
export class ListLotesComponent implements OnInit {
  public tableActionEnum = TableActionsEnum;
  public lotes$!: Observable<ILote[]>;
  public manzanasList$!: Observable<IManzana[]>;
  public isLoading = false;

  // Controles
  public proyectoIdControl = new FormControl<string>('');
  public manzanaIdControl = new FormControl<string | null>({ value: null, disabled: true });

  // 🔍 NUEVO: Control para el buscador
  public searchControl = new FormControl<string>('');

  public viewMode: 'table' | 'map' = 'table';
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
          case TEstadoLote.DISPONIBLE:
            color = '#059669'; bg = '#d1fae5'; break; // Verde
          case TEstadoLote.RESERVADO:
            color = '#d97706'; bg = '#fef3c7'; break; // Naranja
          case TEstadoLote.VENDIDO:
            color = '#dc2626'; bg = '#fee2e2'; break; // Rojo
          case TEstadoLote.BLOQUEADO:
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
    private nzModal: NzModalService,
    private drawerService: NzDrawerService,
    private breakpointObserver: BreakpointObserver,
  ) { }

  ngOnInit(): void {
    // 1. Cargar primer proyecto
    this.proyectoService.getProyectos().subscribe(proyectos => {
      if (proyectos.length > 0) {
        this.proyectoIdControl.setValue(proyectos[0].id);
      }
    });

    // 2. Proyecto cambia -> Carga Manzanas
    this.proyectoIdControl.valueChanges.subscribe(proyectoId => {
      if (proyectoId) {
        this.manzanasList$ = this.manzanaService.getManzanas(proyectoId);
        this.manzanaIdControl.enable();
        this.manzanaIdControl.setValue(null);
        this.searchControl.setValue(''); // Limpia búsqueda al cambiar proyecto
      } else {
        this.manzanaIdControl.disable();
        this.manzanaIdControl.setValue(null);
      }
    });

    // 3. Manzana cambia -> Carga Lotes
    this.manzanaIdControl.valueChanges.subscribe(manzanaId => {
      this.searchControl.setValue(''); // Limpia búsqueda al cambiar manzana
      if (manzanaId) {
        this.loadLotes(manzanaId);
      } else {
        this.lotes$ = of([]);
      }
    });

    // 🔍 4. Lógica del Buscador
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Espera 300ms
      distinctUntilChanged() // Evita buscar lo mismo
    ).subscribe(term => {
      const manzanaId = this.manzanaIdControl.value;
      if (!manzanaId) return;

      if (term && term.length > 0) {
        this.searchLotes(manzanaId, term);
      } else {
        this.loadLotes(manzanaId);
      }
    });

  }

  private loadLotes(manzanaId: string): void {
    this.isLoading = true;
    this.lotes$ = this.loteService.getLotes(manzanaId).pipe(
      finalize(() => this.isLoading = false)
    );
  }

  // 🔍 Método para búsqueda
  private searchLotes(manzanaId: string, term: string): void {
    this.isLoading = true;
    this.lotes$ = this.loteService.searchLotes(manzanaId, term).pipe(
      finalize(() => this.isLoading = false)
    );
  }

  // 🚀 Método para cambio de estado rápido
  private cambiarEstadoRapido(lote: ILote): void {
    // Lógica simple para ciclar estados. 
    // En una app real, aquí podría abrirse un mini-menú contextual.
    const estados: TEstadoLote[] = Object.values(TEstadoLote);
    const currentIndex = estados.indexOf(lote.estado);
    const nextIndex = (currentIndex + 1) % estados.length;
    const nuevoEstado = estados[nextIndex];

    this.loteService.updateEstadoLote(lote.id, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.notification.success(`Estado cambiado a ${nuevoEstado}`);
        // Refrescar lista actual
        const currentManzana = this.manzanaIdControl.value;
        const currentSearch = this.searchControl.value;

        if (currentSearch) {
          this.searchLotes(currentManzana!, currentSearch);
        } else {
          this.loadLotes(currentManzana!);
        }
      },
      error: () => this.notification.error('No se pudo cambiar el estado')
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
    const modalRef = this.modalService.open(RegisterLotesComponent, { size: 'lg' });

    modalRef.componentInstance.manzanaId = manzanaId;
    if (data) {
      modalRef.componentInstance.loteData = data;
    }

    modalRef.result.then((result) => {
      if (result && this.manzanaIdControl.value) {
        // Si estábamos buscando, recargamos búsqueda, sino lista normal
        if (this.searchControl.value) {
          this.searchLotes(this.manzanaIdControl.value, this.searchControl.value);
        } else {
          this.loadLotes(this.manzanaIdControl.value);
        }
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
              if (this.manzanaIdControl.value) this.loadLotes(this.manzanaIdControl.value);
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

  public openDetailDrawer(loteId: string): void {
    const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);
    if (isMobile) {
      this.modalService.open(LoteDetailComponent, {
        size: 'fullscreen', // En móvil, mejor que ocupe todo
        scrollable: true,
        windowClass: 'terraform-modal-mobile'
      }).componentInstance.loteId = loteId;
    } else {
      this.drawerService.create({
        nzContent: LoteDetailComponent,
        nzTitle: '',
        nzClosable: false,
        nzMaskClosable: true,
        nzWidth: 450,
        nzData: {
          loteId: loteId
        }
      });
    }
  }
}