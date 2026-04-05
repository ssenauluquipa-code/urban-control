import { Routes } from "@angular/router";

export const INMOBILIARIA_ROUTES: Routes = [
  { path: 'lotes', loadComponent: () => import('./pages/list-lotes.component').then(m => m.ListLotesComponent) },
]
