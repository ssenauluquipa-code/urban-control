import { Routes } from "@angular/router";

export const RESERVA_ROUTES: Routes = [
    { path: '', loadComponent: () => import('./page/list-reservas/list-reservas.component').then(m => m.ListReservasComponent) },
]
