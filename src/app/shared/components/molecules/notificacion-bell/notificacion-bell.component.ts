import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificacionService } from 'src/app/core/services/notificacion.service';
import { INotificacion, INotificacionResumen, TipoNotificacion } from 'src/app/core/models/notificacion.model';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-notificacion-bell',
  standalone: true,
  imports: [CommonModule, NgbDropdownModule, NzIconModule],
  templateUrl: './notificacion-bell.component.html',
  styleUrl: './notificacion-bell.component.scss'
})
export class NotificacionBellComponent implements OnInit, OnDestroy {
  private notiService = inject(NotificacionService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Estados reactivos expuestos a la vista
  public resumen: INotificacionResumen = { totalNoLeidas: 0, cuotasPorVencer: 0, cuotasVencidas: 0, lotesLiberados: 0 };
  public alertas: INotificacion[] = [];
  public cargando = false;

  ngOnInit(): void {
    // Solo se suscribe al stream compartido del repositorio (singleton)
    // El polling real vive en NotificacionRepository, no aquí
    this.notiService.getContadorAlertas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resumenData) => {
          if (resumenData) this.resumen = resumenData;
        }
      });
  }

  /**
   * Carga bajo demanda (Lazy loading) al desplegar la campana
   */
  onDropdownOpen(): void {
    this.cargando = true;
    this.notiService.getAlertasMenuCampana(25)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (listaAlertas) => {
          this.alertas = listaAlertas;
          this.cargando = false;
        },
        error: () => this.cargando = false
      });
  }

  marcarComoLeida(id: string, event: Event): void {
    event.stopPropagation(); // Evita que se cierre el dropdown inesperadamente
    this.notiService.marcarAlertaComoLeida(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alertas = this.alertas.filter(a => a.id !== id);
          if (this.resumen.totalNoLeidas > 0) {
            this.resumen.totalNoLeidas--;
          }
        }
      });
  }

  marcarTodasComoLeidadas(): void {
    this.notiService.limpiarTodasLasAlertas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.alertas = [];
          this.resumen = {
            totalNoLeidas: 0,
            cuotasPorVencer: 0,
            cuotasVencidas: 0,
            lotesLiberados: 0
          };
        }
      });
  }

  getIconByTipo(tipo: TipoNotificacion): string {
    if (tipo.startsWith('CUOTA')) return 'calendar';
    if (tipo.startsWith('LOTE')) return 'environment';
    return 'bell';
  }

  getColorClassByTipo(tipo: TipoNotificacion): string {
    if (tipo === 'CUOTA_VENCIDA') return 'bg-light-danger text-danger';
    if (tipo === 'CUOTA_POR_VENCER') return 'bg-light-warning text-warning';
    return 'bg-light-primary text-primary';
  }

  goToHistorial(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/notificaciones/historial']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
