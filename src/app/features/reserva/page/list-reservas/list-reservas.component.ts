import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { finalize } from 'rxjs';
import { EstadoReserva, IReserva } from 'src/app/core/models/reserva.model';
import { ConfirmationService } from 'src/app/core/services/confirmation.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReservaService } from 'src/app/core/services/reserva.service';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RegisterReservaComponent } from '../register-reserva/register-reserva.component';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StatusReservaFloatingFilterComponent, StatusReservaFloatingFilterParams } from 'src/app/shared/components/organisms/status-reserva-floating-filter.component';
@Component({
  selector: 'app-list-reservas',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PageContainerComponent,
    ReactiveFormsModule
  ],
  templateUrl: './list-reservas.component.html',
  styleUrl: './list-reservas.component.scss'
})
export class ListReservasComponent implements OnInit {
  // Servicios e inyecciones
  private reservaService = inject(ReservaService);
  private confirmation = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private globalContext = inject(ProjectStatusGlobalService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // Propiedades de estado
  public tableActionEnum = TableActionsEnum;
  public reservas: IReserva[] = [];
  public loading = false;
  public proyectoId: string | null = null;

  // Filtros Reactivos (Única fuente de verdad)
  public clienteControl = new FormControl<string | null>(null);
  public manzanaControl = new FormControl<string | null>(null);
  public estadoControl = new FormControl<string | null>(null);

  // Definición de Columnas para AG Grid
  columnDefs: ColDef[] = [
    {
      field: 'codigoReserva',
      headerName: 'Cód. Reserva',
      width: 115,
      cellStyle: { fontWeight: 'bold' },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'nombreCliente',
      headerName: 'Nombre del Cliente',
      flex: 1,
      minWidth: 250,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'nroDocumento',
      headerName: 'CI/NIT',
      width: 120,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      headerName: 'Lote',
      valueGetter: (params) => {
        return params.data ? `Mza ${params.data.manzana} - Lt ${params.data.numeroLote}` : '';
      },
      width: 120,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'montoReserva',
      headerName: 'Monto',
      width: 120,
      valueFormatter: (p) => p.data ? `${p.data.moneda} ${p.value}` : '',
      filter: 'agNumberColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: 'fechaVencimiento',
      headerName: 'Vencimiento',
      width: 135,
      // Usamos valueGetter para transformar la fecha en un texto simple DD/MM/YYYY
      // Así el filtro y la celda solo verán la fecha, nunca la hora.
      valueGetter: (params) => {
        if (!params.data?.fechaVencimiento) return '';
        const date = new Date(params.data.fechaVencimiento);
        // Ajuste para evitar problemas de zona horaria al crear la fecha
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      colId: 'estado',
      headerName: 'Estado',
      width: 150,
      valueGetter: (p) => p.data?.estado,
      cellRenderer: BadgeEstadoComponent,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: StatusReservaFloatingFilterComponent,
      floatingFilterComponentParams: {
        onStatusChange: (status: string | undefined) => {
          this.estadoControl.setValue(status || null);
        }
      } as StatusReservaFloatingFilterParams,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    }
  ];

  ngOnInit(): void {
    // 1. Reaccionar al cambio de Proyecto Global
    this.globalContext.selectedProjectId$.subscribe(projectId => {
      this.proyectoId = projectId || null;
      // Reset de filtros locales al cambiar de proyecto
      this.manzanaControl.setValue(null, { emitEvent: false });

      if (projectId) {
        this.loadReservas();
      } else {
        this.reservas = [];
        this.cdr.detectChanges();
      }
    });

    // 2. Escuchar cambios en los Controles (Filtros superiores y de tabla)
    /* 
    // Comentamos la carga remota al cambiar filtros, ahora es local
    merge(
      this.clienteControl.valueChanges.pipe(distinctUntilChanged()),
      this.manzanaControl.valueChanges.pipe(distinctUntilChanged()),
      this.estadoControl.valueChanges.pipe(distinctUntilChanged())
    ).pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadReservas();
    });
    */
  }

  /**
   * Carga las reservas usando los valores actuales de los controles
   */
  loadReservas(): void {
    if (!this.proyectoId) return;

    this.loading = true;

    // En LOCAL cargamos TODO el proyecto una sola vez
    this.reservaService.getReservas(
      this.proyectoId,
      undefined, // estado null para traer todo
      undefined, // cliente null
      undefined  // manzana null
    )
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.reservas = data.map(r => ({
            ...r,
            isActive: r.estado === EstadoReserva.ACTIVA
          }));
        },
        error: () => this.notification.error('Error al cargar reservas')
      });
  }

  onTableAction(event: ITableActionEvent<IReserva>): void {
    if (event.action === TableActionsEnum.ANULAR && event.row?.id) {
      const request$ = this.reservaService.cancelReserva(event.row.id);
      this.confirmation.toggleStatus('Reserva', `#${event.row.codigoReserva}`, true, request$)
        .subscribe(success => {
          if (success) this.loadReservas();
        });
    } else if (event.action === TableActionsEnum.VIEW && event.row?.id) {
      this.router.navigate(['/reservas/detail', event.row.id]);
    } else if (event.action === TableActionsEnum.VENTA && event.row?.reservaId) {
      this.router.navigate(['/ventas/register'], {
        queryParams: { reservaId: event.row.reservaId }
      });
    }
  }

  onAddNew() {
    const modalRef = this.modalService.open(RegisterReservaComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    modalRef.result.then((res) => {
      if (res) this.loadReservas();
    }).catch(() => {
      //
    });
  }
}
