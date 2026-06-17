// src/app/core/services/actividades/actividades.service.ts

import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { finalize } from 'rxjs';
import { ActividadesRepository } from '../repository/actividades.repository';
import { ProjectStatusGlobalService } from './project-status-global.service';
import { IActividad, IActividadesFiltrosDto } from '../models/actividades.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ActividadesService {
  private readonly repository = inject(ActividadesRepository);
  private readonly projectGlobalService = inject(ProjectStatusGlobalService);
  private readonly authService = inject(AuthService);

  // Estados reactivos controlados por Signals
  private readonly _actividades = signal<IActividad[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Selectores públicos de solo lectura para la UI
  public readonly actividades = computed(() => this._actividades());
  public readonly loading = computed(() => this._loading());
  public readonly error = computed(() => this._error());
  
  // Extraemos las primeras 5 actividades para el Dropdown compacto del nav-right
  public readonly topActividadesDropdown = computed(() => this._actividades().slice(0, 5));

  constructor() {
    // Reacción automática: Si el usuario cambia de Proyecto Inmobiliario en el Topbar,
    // refrescamos inmediatamente el historial comercial de actividades si es ADMIN
    effect(() => {
      const activeProject = this.projectGlobalService.getCurrentProjectId(); 
      const currentUser = this.authService.currentUser();
      const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

      if (activeProject && isAdmin) {
        this.cargarActividades({ limit: 20 });
      } else {
        this._actividades.set([]);
      }
    }, { allowSignalWrites: true });
  }

  public cargarActividades(filtros: IActividadesFiltrosDto = {}): void {
    const currentUser = this.authService.currentUser();
    const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
    if (!isAdmin) {
      this._actividades.set([]);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.repository.getActividadesRecientes(filtros)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (response) => {
          this._actividades.set(response.historial || []);
        },
        error: (err) => {
          console.error('Error in ActividadesService:', err);
          this._error.set(err.error?.message || 'Error al obtener el registro de actividades.');
        }
      });
  }
}