import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { EmpresaViewComponent } from "../views/empresa-view/empresa-view.component";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { TabsContainerComponent } from "src/app/shared/components/molecules/tabs-container/tabs-container.component";
import { TabItemComponent } from "src/app/shared/components/atoms/tab-item/tab-item.component";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { IOrganization } from "src/app/core/models/Empresas/empresa-config.model";
import { OrganizationService } from "src/app/core/services/configuracion/organization.service";
import { ListPropietarioComponent } from "./Asesor_propietario/list-propietario.component";
import { RegisterPropietarioModalComponent } from "./Asesor_propietario/register-propietario-modal.component";
import { EAppModule } from "src/app/core/config/permissions.enum";

@Component({
  selector: "app-empresa-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmpresaViewComponent,
    PageContainerComponent,
    TabsContainerComponent,
    TabItemComponent,
    ListPropietarioComponent,
  ],
  template: `
    <app-page-container
      title="Configuración de Empresa"
      [permissionScope]="EAppModule.EMPRESA"
      [showEdit]="activeTabIndex === 0"
      [showNew]="activeTabIndex === 1"
      [showOptions]="false"
      (Edit)="goToEdita()"
      (AddNew)="goToNuevoPropietario()"
    >
      <app-tabs-container (selectedIndexChange)="onTabChange($event)">
        <!-- Tab 1: General -->
        <app-tab-item title="General" icon="shop">
          <app-empresa-view
            [empresaData]="empresaData"
            [isLoading]="isLoading"
            [autoLoad]="false"
            [editable]="true"
          >
          </app-empresa-view>
        </app-tab-item>

        <!-- Tab 2: Asesores -->
        <app-tab-item
          title="Propietarios"
          icon="team"
          [badge]="empresaData?.asesores?.length || 0"
        >
          <app-list-propietario
            [refreshTrigger]="propietariosRefreshTrigger"
          ></app-list-propietario>
        </app-tab-item>
      </app-tabs-container>
    </app-page-container>
  `,
  styles: ``,
})
export class EmpresaPageComponent implements OnInit {
  public readonly EAppModule = EAppModule;
  empresaData: IOrganization | null = null;
  isLoading = false;
  activeTabIndex = 0;
  propietariosRefreshTrigger = 0;

  constructor(
    private empresaService: OrganizationService,
    private router: Router,
    private modalService: NgbModal,
  ) { }

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
        console.error("Error cargando configuración:", err);
        this.isLoading = false;
      },
    });
  }

  onTabChange(index: number): void {
    this.activeTabIndex = index;
  }

  goToEdita(): void {
    this.router.navigate(["/configuracion/empresa-edit"], {
      state: { empresa: this.empresaData },
    });
  }

  goToNuevoPropietario(): void {
    const modalRef = this.modalService.open(RegisterPropietarioModalComponent, {
      size: "lg",
      backdrop: "static",
      keyboard: false,
    });

    modalRef.result
      .then((result) => {
        if (result) {
          this.propietariosRefreshTrigger++;
          this.empresaService.clearCache();
          this.loadData();
        }
      })
      .catch(() => undefined);
  }
}
