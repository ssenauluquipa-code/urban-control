import { Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { EAppModule, EAppAction } from './core/config/permissions.enum';

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
        canActivate: [permissionGuard],
        data: { module: EAppModule.USUARIOS, action: EAppAction.VIEW },
        loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'access',
        canActivate: [permissionGuard],
        data: { module: EAppModule.USUARIOS, action: EAppAction.VIEW },
        loadChildren: () => import('./features/access/access.routes').then(m => m.ACCESS_ROUTES)
      },
      {
        path: 'gestion-inmobiliaria',
        canActivate: [permissionGuard],
        data: { module: EAppModule.PROYECTOS, action: EAppAction.VIEW },
        loadChildren: () => import('./features/Gestión-Inmobiliaria/inmobiliaria.routes').then(m => m.INMOBILIARIA_ROUTES)
      },
      {
        path: 'configuracion',
        canActivate: [permissionGuard],
        data: { module: EAppModule.EMPRESA, action: EAppAction.VIEW },
        loadChildren: () => import('./features/organization/organization.routes').then(m => m.OrganizationRoutes)
      },
      {
        path: 'clientes',
        canActivate: [permissionGuard],
        data: { module: EAppModule.CLIENTES, action: EAppAction.VIEW },
        loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      },
      {
        path: 'asesores',
        canActivate: [permissionGuard],
        data: { module: EAppModule.ASESORES, action: EAppAction.VIEW },
        loadChildren: () => import('./features/asesor/asesor.routes').then(m => m.ASESORES_ROUTES)
      },
      {
        path: 'reservas',
        canActivate: [permissionGuard],
        data: { module: EAppModule.RESERVAS, action: EAppAction.VIEW },
        loadChildren: () => import('./features/reserva/reserva.routes').then(m => m.RESERVA_ROUTES)
      },
      {
        path: 'ventas',
        canActivate: [permissionGuard],
        data: { module: EAppModule.VENTAS, action: EAppAction.VIEW },
        loadChildren: () => import('./features/ventas/ventas.routes').then(m => m.VENTAS_ROUTES)
      },
      {
        path: 'pagos',
        canActivate: [permissionGuard],
        data: { module: EAppModule.PAGOS, action: EAppAction.VIEW },
        loadChildren: () => import('./features/pagos/pagos.routes').then(m => m.PagosRoutes)
      },
      {
        path: 'reportes',
        canActivate: [permissionGuard],
        data: { module: EAppModule.REPORTES, action: EAppAction.VIEW },
        loadChildren: () => import('./features/module_reportes/module_reporte.routes').then(m => m.MODULE_REPORTE)
      },
      {
        path: 'profile',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.PROFILE_ROUTES)
      },
      {
        path: 'notificaciones/historial',
        loadComponent: () =>
          import('./shared/components/molecules/notificacion-historial/notificacion-historial.component')
            .then(m => m.NotificacionHistorialComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
