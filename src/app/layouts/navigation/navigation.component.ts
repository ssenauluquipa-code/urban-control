import { Component, EventEmitter, Output } from '@angular/core';
import { NavContentComponent } from './nav-content/nav-content.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [NavContentComponent, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
  // media 1025 After Use Menu Open
  //NavCollapsedMob = output();
  @Output() NavCollapsedMob = new EventEmitter<void>();

  navCollapsedMob : boolean;
  windowWidth: number;

  // Constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsedMob = false;
  }

  // public method
  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }

}
