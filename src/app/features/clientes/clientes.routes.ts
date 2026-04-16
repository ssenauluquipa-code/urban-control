import { Routes } from "@angular/router";
import { ListClientesComponent } from "./page/list-clientes/list-clientes.component";

export const CLIENTES_ROUTES: Routes = [
    {
        path: '',
        component: ListClientesComponent,
        data: {
            title: 'Gestión de Clientes',
            breadcrumb: 'Clientes'
        }
    }
];
