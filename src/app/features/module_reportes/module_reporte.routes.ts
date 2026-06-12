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
    },
    {
        path: 'ventas',
        loadComponent: () => import('./page/reporte-ventas-page.component')
            .then(m => m.ReporteVentasPageComponent)
    },
    {
        path: 'reservas',
        loadComponent: () => import('./page/reporte-reservas-page.component')
            .then(m => m.ReporteReservasPageComponent)
    },
    {
        path: 'pagos',
        loadComponent: () => import('./page/reporte-pagos-page.component')
            .then(m => m.ReportePagosPageComponent)
    },
    {
        path: 'cuotas_pendientes',
        loadComponent: () => import('./page/reporte-cuotas-page.component')
            .then(m => m.ReporteCuotasPageComponent)
    },
    {
        path: 'asesores',
        loadComponent: () => import('./page/reporte-ventas-asesor-page.component')
            .then(m => m.ReporteVentasAsesorPageComponent)
    },
    {
        path: 'mora',
        loadComponent: () => import('./page/reporte-clientes-mora-page.component')
            .then(m => m.ReporteClientesMoraPageComponent)
    }
];