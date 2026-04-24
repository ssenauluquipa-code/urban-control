import { Routes } from "@angular/router";
import { ListaAsesoresComponent } from "./page/lista-asesores/lista-asesores.component";

export const ASESORES_ROUTES: Routes = [
    {
        path: '',
        component: ListaAsesoresComponent
    },
    {
        path: 'ver/:id',
        loadComponent: () => import('./page/asesor-detail/asesor-detail.component').then(m => m.AsesorDetailComponent)
    }
]