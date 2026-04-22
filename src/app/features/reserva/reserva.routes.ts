import { Routes } from "@angular/router";

export const RESERVA_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./page/list-reservas/list-reservas.component').then(m => m.ListReservasComponent) },
    { path: 'detail/:id', loadComponent: () => import('./page/detail-reserva/detail-reserva.component').then(m => m.DetailReservaComponent) }
]
