import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ActividadTipo, IActividad } from 'src/app/core/models/actividades.model';
import { ActividadesService } from 'src/app/core/services/actividades.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";
import { SelectDataComponent } from "src/app/shared/components/atoms/select-data.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";

// Interface interna para manejar el agrupamiento en la UI
interface IActividadesAgrupadas {
  fechaLabel: string;
  items: IActividad[];
}

@Component({
  selector: 'app-historial-actividades',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NzIconModule, PageContainerComponent, InputDateComponent, SelectDataComponent, InputTextComponent, FormFieldComponent],
  templateUrl: './historial-actividades.component.html',
  styleUrls: ['./historial-actividades.component.scss']
})
export class HistorialActividadesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly actividadesService = inject(ActividadesService);
  private readonly authService = inject(AuthService);

  public readonly tiposOpciones = [
    { id: '', name: '📂 Todos' },
    { id: 'VENTA', name: '🛒 Ventas' },
    { id: 'PAGO', name: '💳 Pagos' },
    { id: 'RESERVA', name: '📅 Reservas' },
    { id: 'LOTE', name: '🏗️ Lotes' }
  ];

  public readonly accionesOpciones = [
    { id: '', name: '🎬 Todas' },
    { id: 'CREADA', name: 'CREADA' },
    { id: 'ACTUALIZADA', name: 'ACTUALIZADA' },
    { id: 'ANULADA', name: 'ANULADA' },
    { id: 'REGISTRADO', name: 'REGISTRADO' },
    { id: 'CANCELADA', name: 'CANCELADA' }
  ];

  // Límite local de paginación acumulativa
  public readonly limiteActual = signal<number>(20);

  // Formulario reactivo unificado en una sola barra horizontal
  public filterForm!: FormGroup;

  public readonly isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
  });

  // Selectores de estado del Core
  public readonly loading = this.actividadesService.loading;
  public readonly error = this.actividadesService.error;
  private readonly listaPlanaActividades = this.actividadesService.actividades;

  /**
   * 🧠 COMPUTED SIGNAL: Transforma la lista plana de actividades en un arreglo
   * agrupado por Día (ej: "Hoy", "Ayer", "10 de Junio, 2026") para cumplir con el diseño 2D.
   */
  public readonly actividadesAgrupadas = computed<IActividadesAgrupadas[]>(() => {
    const lista = this.listaPlanaActividades();
    if (lista.length === 0) return [];

    const grupos: Record<string, IActividad[]> = {};

    lista.forEach(actividad => {
      const fechaFormateada = this.obtenerFechaLabel(actividad.fecha);
      if (!grupos[fechaFormateada]) {
        grupos[fechaFormateada] = [];
      }
      grupos[fechaFormateada].push(actividad);
    });

    return Object.keys(grupos).map(fechaKey => ({
      fechaLabel: fechaKey,
      items: grupos[fechaKey]
    }));
  });

  ngOnInit(): void {
    if (!this.isAdmin()) {
      return;
    }

    this.initForm();
    this.escucharCambiosFiltros();
    this.buscarHistorial();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      tipo: [''],      // Enum: 'VENTA' | 'PAGO' | 'RESERVA' | 'LOTE' | ''
      accion: [''],    // Enum: 'CREADA' | 'ACTUALIZADA' | 'ANULADA' | ''
      fechaDesde: [''],
      fechaHasta: ['']
    });
  }

  private escucharCambiosFiltros(): void {
    // Si cambia cualquier control, reiniciamos el límite a 20 y disparamos búsqueda
    this.filterForm.valueChanges
      .pipe(
        debounceTime(350), // Evita peticiones repetidas al tipear rápido en el buscador
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.limiteActual.set(20);
        this.buscarHistorial();
      });
  }

  public buscarHistorial(): void {
    const valores = this.filterForm.value;
    this.actividadesService.cargarActividades({
      limit: this.limiteActual(),
      tipo: valores.tipo || undefined,
      accion: valores.accion || undefined,
      fechaDesde: valores.fechaDesde || undefined,
      fechaHasta: valores.fechaHasta || undefined
      // Nota: Si tu backend soporta búsquedas por texto libre, le pasas también el "search"
    });
  }

  public cargarMas(): void {
    this.limiteActual.update(prev => prev + 20);
    this.buscarHistorial();
  }

  // Helpers visuales de Estilos
  public getBadgeClass(tipo: ActividadTipo): string {
    const configs: Record<ActividadTipo, string> = {
      VENTA: 'bg-light-success text-success border border-success-subtle',
      PAGO: 'bg-light-primary text-primary border border-primary-subtle',
      RESERVA: 'bg-light-warning text-warning border border-warning-subtle',
      LOTE: 'bg-light-info text-info border border-info-subtle'
    };
    return configs[tipo] || 'bg-light-secondary text-secondary';
  }

  public getInitials(nombre: string): string {
    if (!nombre) return 'US';
    return nombre.split(' ').map(p => p.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  /**
   * Helper para agrupar fechas de forma elegante
   */
  private obtenerFechaLabel(fechaIso: string): string {
    const fechaActividad = new Date(fechaIso);
    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    if (fechaActividad.toDateString() === hoy.toDateString()) {
      return 'HOY';
    } else if (fechaActividad.toDateString() === ayer.toDateString()) {
      return 'AYER';
    } else {
      return fechaActividad.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }
}