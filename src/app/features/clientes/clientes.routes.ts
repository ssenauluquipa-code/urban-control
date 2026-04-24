import { Routes } from '@angular/router';
import { ListClientesComponent } from './page/list-clientes/list-clientes.component';
import { RegisterClientesComponent } from './page/register-clientes/register-clientes.component';
import { ClienteDetailComponent } from './page/cliente-detail/cliente-detail.component';

export const CLIENTES_ROUTES: Routes = [
    {
        path: '',
        component: ListClientesComponent,
        data: {
            title: 'Gestión de Clientes',
            breadcrumb: 'Clientes',
        },
    },
    {
        path: 'nuevo',
        component: RegisterClientesComponent,
        data: { title: 'Nuevo Cliente', breadcrumb: 'Nuevo' },
    },
    {
        path: 'editar/:id',
        component: RegisterClientesComponent,
        data: { title: 'Editar Cliente', breadcrumb: 'Editar' },
    },
    {
        path: 'ver/:id',
        component: ClienteDetailComponent,
        data: { title: 'Detalle del Cliente', breadcrumb: 'Detalle' },
    }
];
