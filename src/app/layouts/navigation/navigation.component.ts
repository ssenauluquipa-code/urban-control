import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NavContentComponent } from './nav-content/nav-content.component';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../../core/services/configuracion/organization.service';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [NavContentComponent, CommonModule, TruncatePipe],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  // media 1025 After Use Menu Open
  //NavCollapsedMob = output();
  @Output() NavCollapsedMob = new EventEmitter<void>();

  navCollapsedMob : boolean;
  windowWidth: number;
  organizationName = 'NOMBRE EMPRESA';
  organizationLogoUrl: string | null = null;
  logoLoaded = false;
  readonly fallbackLogo = '../../../assets/images/logo-icon.svg';

  // Constructor
  constructor(private organizationService: OrganizationService) {
    this.windowWidth = window.innerWidth;
    this.navCollapsedMob = false;
  }

  ngOnInit(): void {
    this.organizationService.getEmpresa().subscribe({
      next: (empresa) => {
        if (empresa?.name) {
          this.organizationName = empresa.name;
        }
        this.organizationLogoUrl = empresa?.logoUrl ?? null;
        this.logoLoaded = true;
      },
      error: () => {
        // En caso de error, se mantiene el valor por defecto
        this.logoLoaded = true;
      }
    });
  }

  // public method
  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }

}
