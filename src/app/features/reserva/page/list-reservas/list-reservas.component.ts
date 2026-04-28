import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { finalize, merge, debounceTime, distinctUntilChanged } from 'rxjs';
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
import { SelectClientesComponent } from 'src/app/shared/components/atoms/select-clientes.component';
import { SelectManzanasComponent } from 'src/app/shared/components/atoms/select-manzanas.component';
import { SelectEstadoReservaComponent } from 'src/app/shared/components/atoms/select-estado-reserva.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { CommonModule } from '@angular/common';
import { StatusReservaFloatingFilterComponent, StatusReservaFloatingFilterParams } from 'src/app/shared/components/organisms/status-reserva-floating-filter.component';
import { ClienteFloatingFilterWrapperComponent } from 'src/app/shared/components/organisms/cliente-floating-filter-wrapper.component';
import { IClienteFloatingFilterParams } from 'src/app/shared/interfaces/table-filters.interface';

@Component({
  selector: 'app-list-reservas',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    PageContainerComponent,
    ReactiveFormsModule,
    SelectClientesComponent,
    SelectManzanasComponent,
    SelectEstadoReservaComponent,
    FormFieldComponent
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
  public estadoControl = new FormControl<string | null>('ACTIVA');

  // Definición de Columnas para AG Grid
  columnDefs: ColDef[] = [
    {
      field: 'codigoReserva',
      headerName: 'Cód. Reserva',
      width: 120,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'nombreCliente',
      headerName: 'Cliente',
      flex: 1,
      minWidth: 250,
      filter: true,
      floatingFilter: true,
      floatingFilterComponent: ClienteFloatingFilterWrapperComponent,
      floatingFilterComponentParams: {
        onClienteChange: (clienteId: string | null) => {
          this.clienteControl.setValue(clienteId); // Dispara el combineLatest
        }
      } as IClienteFloatingFilterParams
    },
    {
      field: 'nroDocumento',
      headerName: 'CI/NIT',
      width: 120,
    },
    {
      headerName: 'Lote',
      valueGetter: (params) => {
        return params.data ? `Mza ${params.data.manzana} - Lt ${params.data.numeroLote}` : '';
      },
      width: 120
    },
    {
      field: 'montoReserva',
      headerName: 'Monto',
      width: 120,
      valueFormatter: (p) => p.data ? `${p.data.moneda} ${p.value}` : ''
    },
    {
      field: 'fechaVencimiento',
      headerName: 'Vencimiento',
      width: 140,
      valueFormatter: (p) => p.value ? new Date(p.value).toLocaleDateString() : ''
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 150,
      cellRenderer: BadgeEstadoComponent,
      filter: true,
      floatingFilter: true,
      floatingFilterComponent: StatusReservaFloatingFilterComponent,
      floatingFilterComponentParams: {
        onStatusChange: (status: string | undefined) => {
          this.estadoControl.setValue(status || null); // Dispara el combineLatest
        }
      } as StatusReservaFloatingFilterParams
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
    merge(
      this.clienteControl.valueChanges.pipe(distinctUntilChanged()),
      this.manzanaControl.valueChanges.pipe(distinctUntilChanged()),
      this.estadoControl.valueChanges.pipe(distinctUntilChanged())
    ).pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadReservas();
    });
  }

  /**
   * Carga las reservas usando los valores actuales de los controles
   */
  loadReservas(): void {
    if (!this.proyectoId) return;

    this.loading = true;

    // Obtenemos valores directamente de los controles para asegurar sincronía
    const estado = this.estadoControl.value || undefined;
    const clienteId = this.clienteControl.value || undefined;
    const manzanaId = this.manzanaControl.value || undefined;

    this.reservaService.getReservas(
      this.proyectoId,
      estado,
      clienteId,
      manzanaId
    )
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          // El service ya normaliza el ID, pero aquí aseguramos isActive para la UI
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
    }
  }

  onAddNew() {
    const modalRef = this.modalService.open(RegisterReservaComponent, {
      size: 'xl',
      backdrop: 'static'
    });
    modalRef.result.then((res) => {
      if (res) this.loadReservas();
    }).catch(() => {
      //
    });
  }
}