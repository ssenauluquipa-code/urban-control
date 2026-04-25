import { Routes } from '@angular/router';

export const OrganizationRoutes: Routes = [
  {
    path: 'empresa',
    loadComponent: () => import('./pages/empresa-page.component').then(m => m.EmpresaPageComponent)
  },
  {
    path: 'empresa-edit',
    loadComponent: () => import('./pages/empresa-edit-page.component').then(m => m.EmpresaEditPageComponent)
  }
]
