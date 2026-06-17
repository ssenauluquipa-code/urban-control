import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Componentes de Arquitectura e Infraestructura Visual de UrbanControl
import { PanelTarjetasComponent, ITarjetaReporte, TipoReporteActivo } from '../panel-tarjetas/panel-tarjetas.component';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';

@Component({
  selector: 'app-reportes-hub',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent,
    PanelTarjetasComponent
  ],
  templateUrl: './reporte-hub.component.html',
  styleUrls: ['./reporte-hub.component.scss']
})
export class ReporteHubComponent implements OnInit {
  private readonly router = inject(Router);

  // Listado unificado con textos, categorías e íconos idénticos a screen.png
  public tarjetasReporte: ITarjetaReporte[] = [
    { 
      id: 'LOTES', 
      titulo: 'Lotes & Inventario', 
      descripcion: 'Estado actual de disponibilidad.', 
      categoria: 'comercial', 
      icono: 'bi-map' 
    },
    { 
      id: 'CLIENTES', 
      titulo: 'Listado de Clientes', 
      descripcion: 'Directorio completo de titulares.', 
      categoria: 'auditoria', 
      icono: 'bi-people' 
    },
    { 
      id: 'RESERVAS', 
      titulo: 'Control de Reservas', 
      descripcion: 'Seguimiento de apartados activos.', 
      categoria: 'caja', 
      icono: 'bi-bookmark' 
    },
    { 
      id: 'VENTAS', 
      titulo: 'Ventas Generales', 
      descripcion: 'Resumen de transacciones realizadas.', 
      categoria: 'comercial', 
      icono: 'bi-wallet2' 
    },
    { 
      id: 'PAGOS', 
      titulo: 'Flujo de Pagos', 
      descripcion: 'Ingresos y egresos proyectados.', 
      categoria: 'caja', 
      icono: 'bi-bank' 
    },
    { 
      id: 'CUOTAS_PENDIENTES', 
      titulo: 'Cuotas Pendientes', 
      descripcion: 'Cronograma de pagos por recibir.', 
      categoria: 'riesgo', 
      icono: 'bi-clock' 
    },
    { 
      id: 'MORA', 
      titulo: 'Clientes en Mora', 
      descripcion: 'Alertas de cuotas con retraso.', 
      categoria: 'riesgo', 
      icono: 'bi-exclamation-triangle' 
    },
    { 
      id: 'ASESORES', 
      titulo: 'Rendimiento de Asesores', 
      descripcion: 'Productividad del equipo de ventas.', 
      categoria: 'auditoria', 
      icono: 'bi-graph-up' 
    }
  ];

  ngOnInit(): void {
    // Hook listo por si requieres inicializaciones globales del sistema de reportes
  }

  /**
   * Captura el evento emitido por el componente hijo (panel-tarjetas)
   * @param idReporte Identificador único del reporte seleccionado
   */
  public abrirReporte(idReporte: TipoReporteActivo): void {
    
    // Al hacer clic, rediriges limpiamente usando el enrutador de Angular hacia tus sub-módulos dedicados
    this.router.navigate(['/reportes', idReporte.toLowerCase()]);
  }
}