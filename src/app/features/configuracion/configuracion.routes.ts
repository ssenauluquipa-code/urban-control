import { Routes } from '@angular/router';

export const ConfiguracionRoutes : Routes = [
  {
    path: 'empresa',
    loadComponent : () => import('./pages/empresa-page.component').then(m => m.EmpresaPageComponent)
  },
  {
    path: 'empresa-edit',
    loadComponent : () => import('././components/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent)
  }
]
