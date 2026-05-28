import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ColDef } from 'ag-grid-community';
import { of } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map, switchMap, tap } from 'rxjs/operators';

import { TipoNotificacion, INotificacion, INotificacionFilter } from 'src/app/core/models/notificacion.model';
import { NotificacionService } from 'src/app/core/services/notificacion.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { PageContainerComponent } from '../../templates/page-container/page-container.component';

interface INotificacionDetalle extends INotificacion {
  lote?: { id?: string };
  venta?: { id?: string };
}

@Component({
  selector: 'app-notificacion-historial',
  standalone: true,
  imports: [CommonModule, DataTableComponent, PageContainerComponent],
  providers: [DatePipe],
  templateUrl: './notificacion-historial.component.html',
  styleUrl: './notificacion-historial.component.scss'
})
export class NotificacionHistorialComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly notiService = inject(NotificacionService);
  private readonly notification = inject(NotificationService);
  private readonly globalProjectService = inject(ProjectStatusGlobalService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly datePipe = inject(DatePipe);
  private readonly projectId$ = toObservable(this.globalProjectService.currentProjectId);

  public notificaciones: INotificacion[] = [];
  public loading = false;

  public readonly columnDefs: ColDef<INotificacion>[] = [
    {
      headerName: 'Fecha',
      field: 'createdAt',
      minWidth: 170,
      flex: 1,
      valueFormatter: (params) =>
        params.value ? this.datePipe.transform(params.value, 'dd/MM/yyyy HH:mm') ?? '' : '',
    },
    {
      headerName: 'Tipo',
      field: 'tipo',
      minWidth: 260,
      flex: 1.1,
      cellRenderer: (params: { value: TipoNotificacion }) => this.renderTipoBadge(params.value),
    },
    {
      headerName: 'Título',
      field: 'titulo',
      minWidth: 240,
      flex: 2,
      wrapText: true,
      autoHeight: true,
    },
    {
      headerName: 'Mensaje',
      field: 'mensaje',
      minWidth: 320,
      flex: 2,
      wrapText: true,
      autoHeight: true,
      cellStyle: { display: 'block', 'padding-top': '12px', 'padding-bottom': '12px' },
    },
    {
      headerName: 'Estado',
      field: 'leida',
      minWidth: 140,
      flex: 0.8,
      valueFormatter: (params) => (params.value ? 'Leída' : 'Pendiente'),
      cellRenderer: (params: { value: boolean }) => {
        const color = params.value ? '#52c41a' : '#faad14';
        const label = params.value ? 'Leída' : 'Pendiente';
        return `<span style="display:inline-block;padding:2px 8px;border-radius:12px;background:${color}22;color:${color};font-weight:600;">${label}</span>`;
      },
    },
    {
      headerName: 'Acciones',
      colId: 'acciones',
      minWidth: 260,
      maxWidth: 300,
      sortable: false,
      filter: false,
      suppressMovable: true,
      suppressNavigable: true,
      cellRenderer: (params: { data: INotificacion }) => {
        const noti = params.data;
        if (!noti) return '';
        const botonLeida = noti.leida
          ? ''
          : `<button data-action="marcar" style="border:1px solid #d9d9d9;background:#fff;border-radius:6px;padding:4px 8px;font-size:12px;cursor:pointer;">Marcar como leída</button>`;
        const botonOrigen = `<button data-action="origen" style="border:1px solid #1677ff;background:#1677ff;color:#fff;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;">Ver origen</button>`;
        return `<div style="display:flex;gap:8px;align-items:center;">${botonLeida}${botonOrigen}</div>`;
      },
      onCellClicked: (event) => {
        const target = event.event?.target as HTMLElement | null;
        const action = target?.getAttribute('data-action');
        if (!action || !event.data) return;
        event.event?.stopPropagation();
        if (action === 'marcar') {
          this.marcarComoLeida(event.data);
          return;
        }
        this.abrirOrigen(event.data);
      },
    },
  ];

  ngOnInit(): void {
    // 🚀 Ahora el flujo es ultra directo: solo reacciona cuando cambia el proyecto activo
    this.projectId$
      .pipe(
        distinctUntilChanged(),
        tap(() => {
          this.loading = true;
          this.cdr.markForCheck();
        }),
        switchMap((projectId) => {          
          if (!projectId) {
            return of([] as INotificacion[]);
          }

          // Evitamos forzar limits altos porque algunos endpoints validan un máximo y devuelven 400.
          const apiFilters: INotificacionFilter = {};
          return this.notiService.getHistorialNotificaciones(apiFilters).pipe(
            catchError((error) => {
              console.error('Error cargando historial de notificaciones:', error);
              this.notification.error('No se pudo cargar el historial de notificaciones.');
              return of([] as INotificacion[]);
            })
          );
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((resultado) => {                
        this.notificaciones = resultado;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  public onRowClick(noti: INotificacion): void {
    this.abrirOrigen(noti);
  }

  private marcarComoLeida(noti: INotificacion): void {
    if (noti.leida) return;

    this.notiService
      .marcarAlertaComoLeida(noti.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.notificaciones = this.notificaciones.map((item) =>
          item.id === noti.id ? { ...item, leida: true } : item
        );
        this.cdr.markForCheck();
      });
  }

  private abrirOrigen(noti: INotificacion): void {
    this.notiService
      .obtenerDetalleAlerta(noti.id)
      .pipe(
        switchMap((detalle) => {
          const notificacionDetalle = detalle as INotificacionDetalle;
          const destino = this.obtenerRutaPorTipo(notificacionDetalle);
          if (!destino) return of(null);

          const marcar$ = noti.leida ? of(void 0) : this.notiService.marcarAlertaComoLeida(noti.id);
          return marcar$.pipe(map(() => destino));
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((destino) => {
        if (!destino) return;
        this.notificaciones = this.notificaciones.map((item) =>
          item.id === noti.id ? { ...item, leida: true } : item
        );
        this.router.navigate(destino);
      });
  }

  private obtenerRutaPorTipo(noti: INotificacionDetalle): string[] | null {
    if (
      noti.tipo === 'LOTE_LIBERADO_RESERVA_VENCIDA' ||
      noti.tipo === 'LOTE_LIBERADO_RESERVA_CANCELADA'
    ) {
      const loteId = noti.lote?.id;
      return loteId
        ? ['/gestion-inmobiliaria', 'lotes', 'editar', loteId]
        : null;
    }

    if (noti.tipo === 'CUOTA_VENCIDA' || noti.tipo === 'CUOTA_POR_VENCER') {
      const ventaId = noti.venta?.id;
      return ventaId ? ['/ventas', 'detail', ventaId] : null;
    }

    return null;
  }

  private renderTipoBadge(tipo: TipoNotificacion): string {
    let color = '#1677ff';
    if (tipo === 'CUOTA_VENCIDA') color = '#ff4d4f';
    if (tipo === 'CUOTA_POR_VENCER') color = '#faad14';

    return `<span style="display:inline-block;padding:2px 10px;border-radius:12px;background:${color}22;color:${color};font-weight:600;">${this.formatearTipo(tipo)}</span>`;
  }

  public formatearTipo(tipo: TipoNotificacion): string {
    return tipo.replaceAll('_', ' ');
  }
}
