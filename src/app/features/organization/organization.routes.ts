import { Routes } from '@angular/router';
import { permissionGuard } from "src/app/core/guards/permission.guard";
import { EAppAction, EAppModule } from "src/app/core/config/permissions.enum";

export const OrganizationRoutes: Routes = [
  {
    path: 'empresa',
    canActivate: [permissionGuard],
    data: { module: EAppModule.EMPRESA, action: EAppAction.VIEW },
    loadComponent: () => import('./pages/empresa-page.component').then(m => m.EmpresaPageComponent)
  },
  {
    path: 'empresa-edit',
    canActivate: [permissionGuard],
    data: { module: EAppModule.EMPRESA, action: EAppAction.EDIT },
    loadComponent: () => import('./pages/empresa-edit-page.component').then(m => m.EmpresaEditPageComponent)
  }
]
