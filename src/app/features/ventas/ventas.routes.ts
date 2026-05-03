import { Routes } from '@angular/router';
import { ListVentasComponent } from './page/list-ventas/list-ventas.component';

export const VENTAS_ROUTES: Routes = [
    {
        path: '',
        component: ListVentasComponent,
        data: {
            title: 'Gestión de Ventas',
            breadcrumb: 'Ventas',
        },
    },
];
