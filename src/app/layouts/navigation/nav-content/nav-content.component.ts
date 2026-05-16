import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { NavGroupComponent } from "./nav-group/nav-group.component";
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationItems, INavigationItem } from '../navigation';
import { AccessControlService } from 'src/app/core/services/access-control.service';
import { EAppAction, EAppModule } from 'src/app/core/config/permissions.enum';

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

  private access = inject(AccessControlService);

  constructor(private location: Location,
    private locationStrategy: LocationStrategy,
  ) {
  }

  ngOnInit(): void {
    this.navigation = this.filterMenuByPermissions(NavigationItems);
  }

  private filterMenuByPermissions(items: INavigationItem[]): INavigationItem[] {
    return items
      .map(item => {
        const newItem = { ...item };
        if (newItem.children) {
          newItem.children = this.filterMenuByPermissions(newItem.children);
        }
        return newItem;
      })
      .filter(item => {
        // 1. Si tiene un módulo asignado, verificamos permiso VIEW
        if (item.module) {
          return this.access.can(item.module as EAppModule, EAppAction.VIEW);
        }

        // 2. Si es un grupo o colapsable, lo mostramos si tiene hijos permitidos
        if (item.type === 'group' || item.type === 'collapse') {
          return item.children && item.children.length > 0;
        }

        // 3. Por defecto (items sin módulo como Dashboard), se muestran
        return true;
      });
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
