import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActividadesService } from 'src/app/core/services/actividades.service';
import { ActividadTipo } from 'src/app/core/models/actividades.model';

@Component({
  selector: 'app-actividades-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbDropdownModule, NzIconModule],
  templateUrl: './actividades-dropdown.component.html',
  styleUrls: ['./actividades-dropdown.component.scss']
})
export class ActividadesDropdownComponent implements OnInit {
  private readonly actividadesService = inject(ActividadesService);
  private readonly authService = inject(AuthService);

  // Selectores reactivos mapeados desde el dominio
  public readonly actividades = this.actividadesService.topActividadesDropdown;
  public readonly loading = this.actividadesService.loading;
  public readonly error = this.actividadesService.error;

  // Verificación estricta de seguridad basada en el Signal de tu usuario autenticado (ADMIN o SUPER_ADMIN)
  public readonly isAdmin = computed(() => {
    const role = this.authService.currentUser()?.role;
    return role === 'SUPER_ADMIN' || role === 'ADMIN';
  });

  ngOnInit(): void {
    // Solo golpeamos el backend si el usuario que navega es un Administrador
    if (this.isAdmin()) {
      this.actividadesService.cargarActividades({ limit: 5 });
    }
  }

  /**
   * Helper visual para asignar clases CSS basadas en la paleta de UrbanControl
   * mapeando los Enums estrictos de tu backend.
   */
  public getBadgeConfig(tipo: ActividadTipo): { class: string; icon: string } {
    switch (tipo) {
      case 'VENTA':
        return { class: 'bg-light-success text-success', icon: 'shopping-cart' };
      case 'PAGO':
        return { class: 'bg-light-primary text-primary', icon: 'wallet' };
      case 'RESERVA':
        return { class: 'bg-light-warning text-warning', icon: 'calendar' };
      case 'LOTE':
        return { class: 'bg-light-info text-info', icon: 'appstore' };
      default:
        return { class: 'bg-light-secondary text-secondary', icon: 'clock' };
    }
  }

  /**
   * Extrae de manera segura las iniciales del operador para el avatar circular
   */
  public getInitials(nombre: string): string {
    if (!nombre) return 'US';
    const parts = nombre.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }
}