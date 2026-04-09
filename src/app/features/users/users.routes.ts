import { Routes } from "@angular/router";

export const USERS_ROUTES: Routes = [
  { path: 'usuarios', loadComponent: () => import('./pages/user-list/user-list.component').then(m => m.UserListComponent) },
]
