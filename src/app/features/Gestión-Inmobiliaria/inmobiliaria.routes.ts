import { Routes } from "@angular/router";

export const INMOBILIARIA_ROUTES: Routes = [
  { path: 'proyecto', loadComponent: () => import('./pages/proyectos/lis-proyectos/lis-proyectos.component').then(m => m.LisProyectosComponent) },
  { path: 'manzanas', loadComponent: () => import('./pages/manzana/manzana-list.component').then(m => m.ManzanaListComponent) },
  { path: 'lotes', loadComponent: () => import('./pages/lotes/list-lotes.component').then(m => m.ListLotesComponent) },
]