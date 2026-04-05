import { Component, EventEmitter, Output } from '@angular/core';
import { NavGroupComponent } from "./nav-group/nav-group.component";
import { CommonModule, Location, LocationStrategy } from '@angular/common';
import { RouterModule } from '@angular/router';
import { INavigationItem, NavigationItems } from '../navigation';

@Component({
  selector: 'app-nav-content',
  standalone: true,
  imports: [CommonModule,RouterModule,NavGroupComponent],
  templateUrl: './nav-content.component.html',
  styleUrl: './nav-content.component.scss'
})
export class NavContentComponent {

  @Output() NavCollapsedMob = new EventEmitter<void>();
  

  navigation = NavigationItems;
  windowWidth = window.innerWidth;

  constructor(private location: Location,
    private locationStrategy : LocationStrategy,
  ){
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
