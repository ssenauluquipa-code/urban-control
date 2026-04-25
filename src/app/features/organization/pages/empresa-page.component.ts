import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmpresaViewComponent } from "../views/empresa-view/empresa-view.component";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { Router } from '@angular/router';
import { IOrganization } from 'src/app/core/models/Empresas/empresa-config.model';
import { OrganizationService } from 'src/app/core/services/configuracion/organization.service';

@Component({
  selector: 'app-empresa-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmpresaViewComponent, PageContainerComponent],
  template: `
    <app-page-container
    title="Configuración de Empresa"
    permissionScope="empresa"
    [showEdit]="true"
    [showOptions]="false"
    (Edit)="goToEdita()"
    >
        <app-empresa-view [empresaData]="empresaData" [isLoading]="isLoading" [autoLoad]="false"></app-empresa-view>
    </app-page-container>
  `,
  styles: ``,
})
export class EmpresaPageComponent implements OnInit {

  empresaData: IOrganization | null = null;
  isLoading = false;

  constructor(private empresaService: OrganizationService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadData();
  }



  private loadData(): void {
    this.isLoading = true;
    this.empresaService.getEmpresa().subscribe({
      next: (data) => {
        this.empresaData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando configuración:', err);
        this.isLoading = false;
      },
    });
  }

  goToEdita(): void {
    this.router.navigate(['/configuracion/empresa-edit'], {
      state: { empresa: this.empresaData }
    });
  }

}
