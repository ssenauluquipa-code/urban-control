import { Routes } from '@angular/router';
import { ListVentasComponent } from './page/list-ventas/list-ventas.component';
import { RegisterVentasComponent } from './page/register-ventas.component';
import { DetailVentaComponent } from './page/detail-venta/detail-venta.component';

export const VENTAS_ROUTES: Routes = [
    {
        path: '',
        component: ListVentasComponent,
        data: {
            title: 'Gestión de Ventas',
            breadcrumb: 'Ventas',
        },
    },
    {
        path: 'register',
        component: RegisterVentasComponent,
    },
    {
        path: 'detail/:id',
        component: DetailVentaComponent,
        data: {
            title: 'Detalle de Venta',
            breadcrumb: 'Detalle',
        },
    }
];
