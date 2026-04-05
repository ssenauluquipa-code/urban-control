import { CommonModule } from "@angular/common";
import { Component, OnInit, HostListener } from "@angular/core";
import { Router, RouterModule } from "@angular/router";

import { SidebarComponent } from "src/app/shared/sidebar/sidebar.component";
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { NavigationComponent } from "../navigation/navigation.component";

//declare var $: any;

@Component({
  selector: "app-full-layout",
  standalone: true,
  imports:[RouterModule, CommonModule, NgbCollapseModule,
    NavBarComponent, NavigationComponent
  ],
  templateUrl: "./full.component.html",
  styleUrls: ["./full.component.scss"],
})
export class FullComponent implements OnInit {

  navCollapsed: boolean = false;
  navCollapsedMob: boolean = false;

  constructor(public router: Router) {}
  public isCollapsed = false;
  public innerWidth: number = 0;
  public defaultSidebar: string = "";
  public showMobileMenu = false;
  public expandLogo = false;
  public sidebartype = "full";

  Logo() {
    this.expandLogo = !this.expandLogo;
  }

  ngOnInit() {
    if (this.router.url === "/") {
      this.router.navigate(["/dashboard"]);
    }
    this.defaultSidebar = this.sidebartype;
    this.handleSidebar();
    this.adjustLayout();

    // Cerrar menú móvil al navegar
    this.router.events.subscribe(() => {
      this.navCollapsedMob = false;
    });
  }

  @HostListener("window:resize")
  onResize() {
    this.handleSidebar();
    this.adjustLayout();
  }

  handleSidebar() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 1170) {
      this.sidebartype = "full";
    } else {
      this.sidebartype = this.defaultSidebar;
    }
  }

  toggleSidebarType() {
    switch (this.sidebartype) {
      case "full":
        this.sidebartype = "mini-sidebar";
        break;

      case "mini-sidebar":
        this.sidebartype = "full";
        break;

      default:
    }
  }
  ///
  navMobClick():void {
    this.navCollapsedMob = !this.navCollapsedMob;
  }

  toggleCompactMode(): void {
    const isMobileOrTable = window.innerWidth <= 1024;
    if(isMobileOrTable){
      this.navCollapsedMob = !this.navCollapsedMob;
      this.navCollapsed = false;
    }else{
      this.navCollapsed = !this.navCollapsed;
      this.navCollapsedMob = false;
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.navCollapsed = false;
      this.navCollapsedMob = false;
    }
  }
  closeMenu():void {
    this.navCollapsedMob = false;
  }

  private adjustLayout(): void {
    const isMobileOrTable = window.innerWidth <= 1024;
    if(isMobileOrTable){
      this.navCollapsedMob = false;
      this.navCollapsed = false;
    }
  }
}
