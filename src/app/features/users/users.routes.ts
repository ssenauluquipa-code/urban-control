import { Routes } from "@angular/router";
import { permissionGuard } from "src/app/core/guards/permission.guard";
import { EAppAction, EAppModule } from "src/app/core/config/permissions.enum";

export const USERS_ROUTES: Routes = [
  { 
    path: 'usuarios', 
    canActivate: [permissionGuard],
    data: { module: EAppModule.USUARIOS, action: EAppAction.VIEW },
    loadComponent: () => import('./pages/user-list/user-list.component').then(m => m.UserListComponent) 
  },
  {
    path: 'historial-actividades',
    canActivate: [permissionGuard],
    data: { module: EAppModule.USUARIOS, action: EAppAction.VIEW },
    loadComponent: () => import('../admin/page/historial-actividades/historial-actividades.component').then(m => m.HistorialActividadesComponent)
  }
];
