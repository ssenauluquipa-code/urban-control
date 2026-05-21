import { Routes } from '@angular/router';
import { ListVentasComponent } from './page/list-ventas/list-ventas.component';
import { RegisterVentasComponent } from './page/register-ventas.component';
import { DetailVentaComponent } from './page/detail-venta/detail-venta.component';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { EAppAction, EAppModule } from 'src/app/core/config/permissions.enum';

/** Rutas del módulo ventas: listado, registro y detalle. */
export const VENTAS_ROUTES: Routes = [
    {
        path: '',
        component: ListVentasComponent,
        canActivate: [permissionGuard],
        data: {
            title: 'Gestión de Ventas',
            breadcrumb: 'Ventas',
            module: EAppModule.VENTAS,
            action: EAppAction.VIEW
        },
    },
    {
        path: 'register',
        component: RegisterVentasComponent,
        canActivate: [permissionGuard],
        data: { 
            module: EAppModule.VENTAS, 
            action: EAppAction.CREATE 
        },
    },
    {
        path: 'detail/:id',
        component: DetailVentaComponent,
        canActivate: [permissionGuard],
        data: {
            title: 'Detalle de Venta',
            breadcrumb: 'Detalle',
            module: EAppModule.VENTAS,
            action: EAppAction.VIEW
        },
    }
];
