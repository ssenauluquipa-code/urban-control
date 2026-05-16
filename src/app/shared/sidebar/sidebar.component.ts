import { Component, inject, OnInit } from '@angular/core';
import { ROUTES } from './menu-items';
import { IRouteInfo } from './sidebar.metadata';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule, NgIf } from '@angular/common';
import { AccessControlService } from 'src/app/core/services/access-control.service';
import { EAppModule, EAppAction } from 'src/app/core/config/permissions.enum';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  showMenu = '';
  showSubMenu = '';
  public sidebarnavItems: IRouteInfo[] = [];

  private access = inject(AccessControlService);

  // this is for the open close
  addExpandClass(element: string) {
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
    }
  }

  constructor(
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  // End open close
  ngOnInit() {
    const user = this.access['auth'].currentUser();

    this.sidebarnavItems = ROUTES.filter(item => {
      if (!item.module) {
        return true;
      }

      const canView = this.access.can(item.module as EAppModule, EAppAction.VIEW);
      return canView;
    });
  }
}
