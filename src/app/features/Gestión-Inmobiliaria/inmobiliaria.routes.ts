import { Routes } from "@angular/router";
import { permissionGuard } from "src/app/core/guards/permission.guard";
import { EAppModule, EAppAction } from "src/app/core/config/permissions.enum";

export const INMOBILIARIA_ROUTES: Routes = [
  {
    path: 'proyecto',
    children: [
      {
        path: '',
        canActivate: [permissionGuard],
        data: { module: EAppModule.PROYECTOS, action: EAppAction.VIEW },
        loadComponent: () => import('./pages/proyectos/lis-proyectos/lis-proyectos.component').then(m => m.LisProyectosComponent)
      },
      {
        // 🚀 NUEVA RUTA: Carga Masiva de Manzanas/Lotes
        path: ':id/carga-masiva',
        canActivate: [permissionGuard],
        // NOTA: Usamos EAppAction.CREATE por defecto, cámbialo si definiste un permiso específico
        data: { module: EAppModule.PROYECTOS, action: EAppAction.CREATE },
        loadComponent: () => import('./pages/proyectos/mass-load-view/mass-load-view.component').then(m => m.MassLoadViewComponent)
      }
    ]
  },
  {
    path: 'manzanas',
    canActivate: [permissionGuard],
    data: { module: EAppModule.MANZANAS, action: EAppAction.VIEW },
    loadComponent: () => import('./pages/manzana/manzana-list.component').then(m => m.ManzanaListComponent)
  },
  {
    path: 'lotes',
    children: [
      {
        path: '',
        canActivate: [permissionGuard],
        data: { module: EAppModule.LOTES, action: EAppAction.VIEW },
        loadComponent: () => import('./pages/lotes/list-lotes.component').then(m => m.ListLotesComponent)
      },
      {
        path: 'crear',
        canActivate: [permissionGuard],
        data: { module: EAppModule.LOTES, action: EAppAction.CREATE },
        loadComponent: () => import('./pages/lotes/register-lotes.component').then(m => m.RegisterLotesComponent)
      },
      {
        path: 'editar/:id',
        canActivate: [permissionGuard],
        data: { module: EAppModule.LOTES, action: EAppAction.EDIT },
        loadComponent: () => import('./pages/lotes/register-lotes.component').then(m => m.RegisterLotesComponent)
      },
    ]
  },
]