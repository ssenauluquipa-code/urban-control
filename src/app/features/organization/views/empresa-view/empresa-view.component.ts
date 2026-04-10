import { Component, inject, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService } from 'src/app/core/services/configuracion/organization.service';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';
import { IOrganization } from 'src/app/core/models/Empresas/empresa-config.model';

@Component({
  selector: 'app-empresa-view',
  standalone: true,
  imports: [CommonModule, CardContainerComponent, InputTextInfoComponent],
  templateUrl: './empresa-view.component.html',
  styleUrl: './empresa-view.component.scss'
})
export class EmpresaViewComponent implements OnInit {
  private empresaService = inject(OrganizationService);

  @Input() empresaData: IOrganization | null = null;
  @Input() isLoading = false;
  @Input() autoLoad = true;

  ngOnInit(): void {
    if (this.autoLoad && !this.empresaData) {
      this.loadData();
    }
  }

  public loadData(): void {
    this.isLoading = true;
    this.empresaService.getEmpresa().subscribe({
      next: (data) => {
        this.empresaData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando configuración:', err);
        this.isLoading = false;
      }
    });
  }
}
