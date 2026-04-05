import { Routes } from '@angular/router';

export const ACCESS_ROUTES: Routes = [
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent)
  },
  {
    path: 'roles',
    loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent)
  },
  {
    path: 'permisos',
    loadComponent: () => import('../../features/auth/page/permissions-page/permissions-page.component').then(m => m.PermissionsPageComponent)
  },
  {
    path: '',
    redirectTo: 'usuarios',
    pathMatch: 'full'
  }
];
