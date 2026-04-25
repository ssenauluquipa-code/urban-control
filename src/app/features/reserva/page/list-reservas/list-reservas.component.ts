import { Component, inject, OnInit } from '@angular/core';
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
import { SelectClientesComponent } from 'src/app/shared/components/atoms/select-clientes.component';
import { SelectManzanasComponent } from 'src/app/shared/components/atoms/select-manzanas.component';
import { SelectEstadoReservaComponent } from 'src/app/shared/components/atoms/select-estado-reserva.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';

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
  public tableActionEnum = TableActionsEnum;
  public reservas: IReserva[] = [];
  public loading = false;
  public proyectoId: string | null = null;

  // Filtros Reactivos
  public clienteControl = new FormControl<string | null>(null);
  public manzanaControl = new FormControl<string | null>(null);
  public estadoControl = new FormControl<string | null>('ACTIVA');

  // Columnas
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
      minWidth: 200
    },
    {
      field: 'nroDocumento',
      headerName: 'CI/NIT',
      width: 120
    },
    {
      headerName: 'Lote',
      valueGetter: (params) => {
        return `Mza ${params.data?.manzana} - Lt ${params.data?.numeroLote}`;
      },
      width: 120
    },
    {
      field: 'montoReserva',
      headerName: 'Monto',
      width: 120,
      valueFormatter: (p) => `${p.data?.moneda} ${p.value}`
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
      width: 120,
      cellRenderer: BadgeEstadoComponent
    }
  ];

  // Inyecciones
  private reservaService = inject(ReservaService);
  private confirmation = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private globalContext = inject(ProjectStatusGlobalService); // Inyectar
  private modalService = inject(NgbModal);
  private router = inject(Router);

  ngOnInit(): void {
    // 1. Reaccionar al cambio de Proyecto Global
    this.globalContext.selectedProjectId$.subscribe(projectId => {
      this.proyectoId = projectId || null;
      // Al cambiar de proyecto, limpiamos manzana pero mantenemos cliente
      this.manzanaControl.setValue(null);
      if (projectId) {
        this.loadReservas();
      } else {
        this.reservas = [];
      }
    });

    // 2. Reaccionar a cambios en los filtros locales
    combineLatest([
      this.clienteControl.valueChanges.pipe(distinctUntilChanged()),
      this.manzanaControl.valueChanges.pipe(distinctUntilChanged()),
      this.estadoControl.valueChanges.pipe(distinctUntilChanged())
    ]).pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.loadReservas();
    });
  }

  loadReservas(): void {
    if (!this.proyectoId) return;

    this.loading = true;

    this.reservaService.getReservas(
      this.proyectoId,
      this.estadoControl.value || undefined,
      this.clienteControl.value || undefined,
      this.manzanaControl.value || undefined
    )
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.reservas = data.map(r => ({
            ...r,
            id: r.reservaId || r.id, // Normalización
            isActive: r.estado === EstadoReserva.ACTIVA // Para el botón Anular
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
          if (success) {
            this.loadReservas();
          }
        });
    } else if (event.action === TableActionsEnum.VIEW && event.row?.id) {
      this.router.navigate(['/reservas/detail', event.row.id]);
    }
  }

  onAddNew() {
    const modalRef = this.modalService.open(RegisterReservaComponent, {
      size: 'xl',
      backdrop: 'static' // Evita cerrar al hacer clic fuera
    });
    modalRef.result.then((res) => {
      if (res) {
        this.loadReservas();
      }
    }).catch(() => {
      ///
    });
  }
}
