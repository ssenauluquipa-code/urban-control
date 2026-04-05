import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-nav-left',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './nav-left.component.html',
  styleUrl: './nav-left.component.scss'
})
export class NavLeftComponent {
  @Input() navCollapsed: boolean = false;
  @Input() isMobOpen: boolean = false;
  
  @Output() NavCollapse = new EventEmitter<void>();
  @Output() NavCollapsedMob = new EventEmitter<void>();
  
  windowWidth: number;

  constructor() {
    this.windowWidth = window.innerWidth;
  }

  navCollapse() {
    this.NavCollapse.emit();
  }
}
