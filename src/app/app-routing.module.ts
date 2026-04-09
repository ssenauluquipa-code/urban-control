
import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { authGuard } from './core/guards/auth.guard';

export const Approutes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'about',
        loadChildren: () => import('./about/about.module').then(m => m.AboutModule)
      },
      {
        path: 'component',
        loadChildren: () => import('./component/component.module').then(m => m.ComponentsModule)
      },
      {
        path: 'showcase',
        loadComponent: () => import('./features/design-system-showcase/design-system-showcase.component').then(m => m.DesignSystemShowcaseComponent)
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'access',
        loadChildren: () => import('./features/access/access.routes').then(m => m.ACCESS_ROUTES)
      },
      {
        path: 'gestion-inmobiliaria',
        loadChildren: () => import('./features/Gestión-Inmobiliaria/inmobiliaria.routes').then(m => m.INMOBILIARIA_ROUTES)
      },
      {
        path: 'organization',
        loadChildren: () => import('./features/organization/organization.routes').then(m => m.OrganizationRoutes)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
