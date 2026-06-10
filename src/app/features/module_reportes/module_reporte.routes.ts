import { Routes } from '@angular/router';
import { ReporteHubComponent } from './components/reporte-hub/reporte-hub.component';

export const MODULE_REPORTE : Routes = [
    {
        path: 'reporte-hub',
        component: ReporteHubComponent
    },        
    {
        // Al entrar a /reportes/lotes cargamos perezosamente la página del reporte
        path: 'lotes',
        loadComponent: () => import('./page/reporte-lotes-page.component')
            .then(m => m.ReporteLotesPageComponent)
    },
    {
        path: 'clientes',
        loadComponent: () => import('./page/reporte-clientes-page.component')
            .then(m => m.ReporteClientesPageComponent)
    }
];