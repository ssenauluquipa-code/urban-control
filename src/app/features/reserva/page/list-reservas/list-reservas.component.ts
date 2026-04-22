import { Component, inject, OnInit } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
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

@Component({
  selector: 'app-list-reservas',
  standalone: true,
  imports: [DataTableComponent, PageContainerComponent],
  templateUrl: './list-reservas.component.html',
  styleUrl: './list-reservas.component.scss'
})
export class ListReservasComponent implements OnInit {
  public tableActionEnum = TableActionsEnum;
  public reservas: IReserva[] = [];
  public loading = false;

  // Filtro de estado local (solo el estado, el proyecto viene del header)
  public estadoFilter: string | undefined = 'ACTIVA';

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
      cellRenderer: (params: ICellRendererParams) => {
        const estado = params.value;
        let badgeClass = 'bg-secondary-subtle text-secondary'; // Default

        switch (estado) {
          case 'ACTIVA':
            badgeClass = 'bg-warning-subtle text-warning'; // Amarillo/Naranja para activa
            break;
          case 'VENCIDA':
            badgeClass = 'bg-danger-subtle text-danger'; // Rojo para vencida
            break;
          case 'CONVERTIDA':
            badgeClass = 'bg-success-subtle text-success'; // Verde para convertida (éxito)
            break;
          case 'CANCELADA':
            badgeClass = 'bg-secondary-subtle text-secondary'; // Gris para cancelada
            break;
        }

        // Capitalize first letter
        const text = estado ? estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase() : '';
        return `<span class="badge ${badgeClass}">${text}</span>`;
      }
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
    // Nos suscribimos al proyecto GLOBAL
    this.globalContext.selectedProjectId$.subscribe(projectId => {
      if (projectId) {
        this.loadReservas(projectId);
      } else {
        this.reservas = []; // Si no hay proyecto, limpiamos la tabla
      }
    });
  }

  // Ahora recibimos el ID como argumento
  loadReservas(proyectoId: string): void {
    this.loading = true;

    this.reservaService.getReservas(proyectoId, this.estadoFilter)
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

  setFilter(estado: string | undefined): void {
    this.estadoFilter = estado;
    // Debemos obtener el ID actual para recargar
    const currentProjectId = this.globalContext.getCurrentProjectId();
    if (currentProjectId) {
      this.loadReservas(currentProjectId);
    }
  }

  onTableAction(event: ITableActionEvent<IReserva>): void {
    if (event.action === TableActionsEnum.ANULAR && event.row?.id) {
      const request$ = this.reservaService.cancelReserva(event.row.id);
      this.confirmation.toggleStatus('Reserva', `#${event.row.codigoReserva}`, true, request$)
        .subscribe(success => {
          if (success) {
            const currentId = this.globalContext.getCurrentProjectId();
            if (currentId) this.loadReservas(currentId);
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
        const currentId = this.globalContext.getCurrentProjectId();
        if (currentId) this.loadReservas(currentId);
      }
    }).catch(() => {
      ///
    });
  }
}
