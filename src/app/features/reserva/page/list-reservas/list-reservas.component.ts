import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ColDef } from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';

// Modelos e Interfaces
import { EstadoReserva, IReserva } from 'src/app/core/models/reserva.model';
import { EAppModule } from 'src/app/core/config/permissions.enum';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';

// Servicios
import { ConfirmationService } from 'src/app/core/services/confirmation.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReservaService } from 'src/app/core/services/reserva.service';
import { ExportPdfService } from 'src/app/core/services/export-pdf.service';
import { ExportExcelService } from 'src/app/core/services/export-excel.service';

// Componentes Compartidos
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { StatusReservaFloatingFilterComponent } from 'src/app/shared/components/organisms/status-reserva-floating-filter.component';

@Component({
  selector: 'app-list-reservas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    PageContainerComponent,
    NzIconModule
  ],
  templateUrl: './list-reservas.component.html',
})
export class ListReservasComponent implements OnInit {
  @ViewChild(DataTableComponent) private dataTable?: DataTableComponent<IReserva>;

  // Inyección de servicios modernos usando inject()
  private readonly reservaService = inject(ReservaService);
  private readonly globalContext = inject(ProjectStatusGlobalService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly notification = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  // Exponer Enums al Template
  public readonly EAppModule = EAppModule;
  public readonly tableActionEnum = TableActionsEnum;

  // Controles de Filtros Reactivos
  public readonly clienteControl = new FormControl<string | null>(null);
  public readonly manzanaControl = new FormControl<string | null>(null);
  public readonly estadoControl = new FormControl<string | null>('');

  // Convertimos el signal a observable en el contexto válido (inicializador de propiedad)
  private readonly projectId$ = toObservable(this.globalContext.currentProjectId);

  // Estado del Componente
  public reservas: IReserva[] = [];
  public columnDefs: ColDef[] = [];
  public loading: boolean = false;
  public proyectoId: string | null = null;

  ngOnInit(): void {
    this.initFormFilters();
    this.loadColumnDefs();

    // ⚡ Escuchamos de forma reactiva el Observable del Proyecto
    this.projectId$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((projectId: string | null) => {
        this.proyectoId = projectId;
        this.loadReservas(); // El interceptor inyectará automáticamente el header X-Project-Id
      });

    // Suscripción reactiva a los cambios de filtros superiores
    this.clienteControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadReservas());
    this.manzanaControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadReservas());
    this.estadoControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadReservas());
  }

  /**
   * Inicializa o restablece configuraciones de los filtros si es necesario
   */
  private initFormFilters(): void {
    // Si necesitas valores iniciales por defecto, se pueden gestionar aquí
  }

  /**
   * Carga las reservas aplicando los filtros de la barra superior.
   * El ID de Proyecto no se envía aquí, ya que viaja mediante el Header HTTP 'X-Project-Id'
   */
  public loadReservas(): void {
    if (!this.proyectoId) {
      this.reservas = [];
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;

    // Mapeamos los filtros para pasarlos limpiamente según el Swagger (undefined si están vacíos)
    const clienteId = this.clienteControl.value || undefined;
    const manzanaId = this.manzanaControl.value || undefined;
    const estado = this.estadoControl.value || undefined;

    this.reservaService.getReservas(estado, clienteId, manzanaId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data: IReserva[]) => {
          this.reservas = data;
        },
        error: () => {
          this.notification.error('Error al cargar el listado de reservas.');
        }
      });
  }

  /**
   * Manejador de las acciones disparadas desde la tabla de datos
   */
  public onTableAction(event: ITableActionEvent<IReserva>): void {
    if (!event.row) return;

    switch (event.action) {
      case TableActionsEnum.ANULAR:
        if (event.row.id) {
          const request$ = this.reservaService.cancelReserva(event.row.id);          
          this.confirmation.toggleStatus('Reserva', `#${event.row.codigoReserva}`, true, request$)
            .subscribe(success => {
              if (success) this.loadReservas();
            });
        }
        break;

      case TableActionsEnum.VIEW:
        if (event.row.id) {
          this.router.navigate(['/reservas/detail', event.row.id]);
        }
        break;

      case TableActionsEnum.VENTA:
        if (event.row.reservaId) {
          this.router.navigate(['/ventas/register'], {
            queryParams: { reservaId: event.row.reservaId }
          });
        }
        break;

      case TableActionsEnum.DELETE:
        if (event.row.estado === EstadoReserva.CANCELADA && event.row.id) {
          const request$ = this.reservaService.eliminar(event.row.id);
          this.confirmation.confirmDelete('Reserva', `#${event.row.codigoReserva}`, request$, true)
            .subscribe(success => {
              if (success) this.loadReservas();
            });
        } else {
          this.notification.warning('Solo se pueden eliminar físicamente reservas que se encuentren CANCELADAS.');
        }
        break;
      case TableActionsEnum.EDIT:
        if(event.row.id){
          this.router.navigate(['/reservas/edit', event.row.id]);
        }
        break;

      default:
        console.warn('Acción no reconocida en listado de reservas:', event.action);
        break;
    }
  }

  /**
   * Redirección para registrar una nueva reserva
   */
  public onAddNew(): void {
    this.router.navigate(['/reservas/register']);
  }

  public exportarPDF(): void {
    let dataToExport = this.reservas;
    if (this.dataTable?.gridApi) {
      const filtered: IReserva[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportPdfService.exportAsPdf('Gestión de Reservas', this.columnDefs, dataToExport);
  }

  public exportarExcel(): void {
    let dataToExport = this.reservas;
    if (this.dataTable?.gridApi) {
      const filtered: IReserva[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportExcelService.exportAsExcel('Gestión de Reservas', this.columnDefs, dataToExport);
  }

  /**
   * Define las columnas de la tabla utilizando ag-grid de manera fuertemente tipada
   */
  private loadColumnDefs(): void {
    this.columnDefs = [
      {
        headerName: 'Código',
        field: 'codigoReserva',
        filter: 'agTextColumnFilter',
        width: 100,
        minWidth: 90,
      },
      {
        headerName: 'Cliente',
        field: 'nombreCliente',
        filter: 'agTextColumnFilter',
        flex: 2,        
        minWidth: 180,
        floatingFilter: true,
      },
      {
        headerName: 'Manzana',
        field: 'manzana',        
        width: 100,
        minWidth: 80,
      },
      {
        headerName: 'Lote',
        field: 'numeroLote',        
        width: 90,
        minWidth: 80,
      },
      {
        headerName: 'Fecha Reserva',
        field: 'fechaReserva',
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '',
        width: 120,
        minWidth: 105,
      },
      {
        headerName: 'Vencimiento',
        field: 'fechaVencimiento',
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '',
        width: 120,
        minWidth: 105,
      },
      {
        headerName: 'Vendedor',
        field: 'nombreAsesor',
        flex: 1.5,
        minWidth: 150,
      },
      {
        headerName: 'Estado',
        field: 'estado',
        cellRenderer: BadgeEstadoComponent,
        width: 110,
        minWidth: 90,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: StatusReservaFloatingFilterComponent,
        cellClass: 'd-flex align-items-center'
      }
    ];
  }

  
}
