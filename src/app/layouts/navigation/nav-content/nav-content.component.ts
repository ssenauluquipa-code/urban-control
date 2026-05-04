import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { NavGroupComponent } from "./nav-group/nav-group.component";
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationItems, INavigationItem } from '../navigation';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-nav-content',
  standalone: true,
  imports: [CommonModule, RouterModule, NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrl: './nav-content.component.scss'
})
export class NavContentComponent implements OnInit {

  @Output() NavCollapsedMob = new EventEmitter<void>();

  navigation: INavigationItem[] = [];
  windowWidth = window.innerWidth;

  private authService = inject(AuthService);

  constructor(private location: Location,
    private locationStrategy: LocationStrategy,
  ) {
  }

  ngOnInit(): void {
    // Escuchar el usuario logueado para filtrar el menú
    const currentUser = this.authService.currentUser();
    this.navigation = this.filterMenuByPermissions(NavigationItems, currentUser);
  }

  private filterMenuByPermissions(items: INavigationItem[], user: any): INavigationItem[] {
    if (!user) return [];

    // Si es el usuario específico que mencionaste
    if (user.email === 'superadmin@gmail.com') {
      // Definimos estrictamente los IDs de los menús (grupos o items) que TIENE PERMITIDO ver:
      const allowedMenuIds = [
        // Inicio
        'main', 'dashboard', 'plano-lotes-nav',
        // Administración
        'administración', 'usuarios-admin', 'clientes', 'asesores', 'reservas',
        // Gestión Inmobiliaria (todo)
        'gestion-inmobiliaria', 'proyectos', 'manzanas', 'lotes',
        // Configuración (todo)
        'configuracion-group', 'empresa'
      ];

      return items
        .map(item => {
          // Si el item tiene hijos, filtramos sus hijos recursivamente
          const newItem = { ...item };
          if (newItem.children) {
            newItem.children = this.filterMenuByPermissions(newItem.children, user);
          }
          return newItem;
        })
        .filter(item => {
          // Solo mantenemos el item si su ID está en la lista de permitidos
          // O si es un grupo y le quedó al menos un hijo permitido
          const isAllowed = allowedMenuIds.includes(item.id);
          const hasAllowedChildren = item.children && item.children.length > 0;
          return isAllowed || hasAllowedChildren;
        });
    }

    // Para otros usuarios, puedes devolver todo el menú o aplicar otra lógica
    return items;
  }

  fireOutClick() {
    let current_url = this.location.path();
    const baseHref = this.locationStrategy.getBaseHref();
    if (baseHref) {
      current_url = baseHref + this.location.path();
    }
    const link = "a.nav-link[ href='" + current_url + "' ]";
    const ele = document.querySelector(link);
    if (ele !== null && ele !== undefined) {
      const parent = ele.parentElement;
      const up_parent = parent?.parentElement?.parentElement;
      const last_parent = up_parent?.parentElement;
      if (parent?.classList.contains('coded-hasmenu')) {
        parent.classList.add('coded-trigger');
        parent.classList.add('active');
      } else if (up_parent?.classList.contains('coded-hasmenu')) {
        up_parent.classList.add('coded-trigger');
        up_parent.classList.add('active');
      } else if (last_parent?.classList.contains('coded-hasmenu')) {
        last_parent.classList.add('coded-trigger');
        last_parent.classList.add('active');
      }
    }
  }

  navMob() {
    if (this.windowWidth < 1025 && document.querySelector('app-navigation.coded-navbar')?.classList.contains('mob-open')) {
      this.NavCollapsedMob.emit();
    }
  }
}
