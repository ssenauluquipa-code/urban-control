import { Routes } from "@angular/router";
import { ListaAsesoresComponent } from "./page/lista-asesores/lista-asesores.component";
import { permissionGuard } from "src/app/core/guards/permission.guard";
import { EAppAction, EAppModule } from "src/app/core/config/permissions.enum";

export const ASESORES_ROUTES: Routes = [
    {
        path: '',
        component: ListaAsesoresComponent,
        canActivate: [permissionGuard],
        data: { module: EAppModule.ASESORES, action: EAppAction.VIEW }
    },
    {
        path: 'ver/:id',
        canActivate: [permissionGuard],
        data: { module: EAppModule.ASESORES, action: EAppAction.VIEW },
        loadComponent: () => import('./page/asesor-detail/asesor-detail.component').then(m => m.AsesorDetailComponent)
    },
    {
        path: 'registrar',
        canActivate: [permissionGuard],
        data: { module: EAppModule.ASESORES, action: EAppAction.CREATE },
        loadComponent: () => import('./page/register-asesor.component').then(m => m.RegisterAsesorComponent)
    },
    {
        path: 'editar/:id',
        canActivate: [permissionGuard],
        data: { module: EAppModule.ASESORES, action: EAppAction.EDIT },
        loadComponent: () => import('./page/register-asesor.component').then(m => m.RegisterAsesorComponent)
    }
]