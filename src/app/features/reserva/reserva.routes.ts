import { Routes } from "@angular/router";
import { permissionGuard } from "src/app/core/guards/permission.guard";
import { EAppAction, EAppModule } from "src/app/core/config/permissions.enum";

export const RESERVA_ROUTES: Routes = [
    { 
        path: '', 
        canActivate: [permissionGuard],
        data: { module: EAppModule.RESERVAS, action: EAppAction.VIEW },
        loadComponent: () => import('./page/list-reservas/list-reservas.component').then(m => m.ListReservasComponent) 
    },
    { 
        path: 'detail/:id', 
        canActivate: [permissionGuard],
        data: { module: EAppModule.RESERVAS, action: EAppAction.VIEW },
        loadComponent: () => import('./page/detail-reserva/detail-reserva.component').then(m => m.DetailReservaComponent) 
    },
    {
        path: 'register',
        canActivate: [permissionGuard],
        data: { module: EAppModule.RESERVAS, action: EAppAction.CREATE },
        loadComponent: () => import('./page/register-reserva/register-reserva.component').then(m => m.RegisterReservaComponent)
    },
    {
        path: 'edit/:id',
        canActivate:[permissionGuard],
        data: { module : EAppModule.RESERVAS, action: EAppAction.EDIT},
        loadComponent: () => import('./page/register-reserva/register-reserva.component').then(m => m.RegisterReservaComponent)        
    }
]
