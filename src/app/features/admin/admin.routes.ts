import { Routes } from "@angular/router";

export const ADMIN_ROUTES: Routes = [
  { path: 'usuarios', loadComponent: () => import('./pages/user-list/user-list.component').then(m => m.UserListComponent) },
]
