import { Routes } from "@angular/router";

export const INMOBILIARIA_ROUTES: Routes = [
  { path: 'proyecto', loadComponent: () => import('./pages/proyectos/lis-proyectos/lis-proyectos.component').then(m => m.LisProyectosComponent) },
  { path: 'manzanas', loadComponent: () => import('./pages/manzana/manzana-list.component').then(m => m.ManzanaListComponent) },
  { 
    path: 'lotes', 
    children: [
      { path: '', loadComponent: () => import('./pages/lotes/list-lotes.component').then(m => m.ListLotesComponent) },
      { path: 'crear', loadComponent: () => import('./pages/lotes/register-lotes.component').then(m => m.RegisterLotesComponent) },
      { path: 'editar/:id', loadComponent: () => import('./pages/lotes/register-lotes.component').then(m => m.RegisterLotesComponent) },
    ]
  },
]