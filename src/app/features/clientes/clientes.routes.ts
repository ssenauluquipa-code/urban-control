import { Routes } from '@angular/router';
import { ListClientesComponent } from './page/list-clientes/list-clientes.component';
import { RegisterClientesComponent } from './page/register-clientes/register-clientes.component';
import { ClienteDetailComponent } from './page/cliente-detail/cliente-detail.component';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { EAppAction, EAppModule } from 'src/app/core/config/permissions.enum';

export const CLIENTES_ROUTES: Routes = [
    {
        path: '',
        component: ListClientesComponent,
        canActivate: [permissionGuard],
        data: {
            title: 'Gestión de Clientes',
            breadcrumb: 'Clientes',
            module: EAppModule.CLIENTES,
            action: EAppAction.VIEW
        },
    },
    {
        path: 'nuevo',
        component: RegisterClientesComponent,
        canActivate: [permissionGuard],
        data: { 
            title: 'Nuevo Cliente', 
            breadcrumb: 'Nuevo',
            module: EAppModule.CLIENTES,
            action: EAppAction.CREATE
        },
    },
    {
        path: 'editar/:id',
        component: RegisterClientesComponent,
        canActivate: [permissionGuard],
        data: { 
            title: 'Editar Cliente', 
            breadcrumb: 'Editar',
            module: EAppModule.CLIENTES,
            action: EAppAction.EDIT
        },
    },
    {
        path: 'ver/:id',
        component: ClienteDetailComponent,
        canActivate: [permissionGuard],
        data: { 
            title: 'Detalle del Cliente', 
            breadcrumb: 'Detalle',
            module: EAppModule.CLIENTES,
            action: EAppAction.VIEW
        },
    }
];
