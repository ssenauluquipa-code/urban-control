import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NavLeftComponent } from "./nav-left/nav-left.component";
import { NavRightComponent } from './nav-right/nav-right.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [NavLeftComponent, NavRightComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {

  // public props
  //NavCollapse = output<void>();
  @Output() NavCollapse = new EventEmitter<void>();
  //NavCollapsedMob = output<void>();
  @Output() NavCollapsedMob = new EventEmitter<void>();

  @Input() isMobOpen: boolean = false;
  navCollapsed: boolean = false;
  windowWidth: number;

  // Constructor
  constructor() {
    this.windowWidth = window.innerWidth;
  }

  // public method
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }
}
