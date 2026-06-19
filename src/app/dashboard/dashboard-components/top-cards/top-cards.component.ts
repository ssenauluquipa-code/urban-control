import { Component, effect, inject } from "@angular/core";
import { CommonModule, NgFor } from "@angular/common";
import { Router } from "@angular/router";
import { animationFrameScheduler } from "rxjs";
import { ITopcard } from "./top-cards-data";
import { LoteService } from "src/app/core/services/proyectos/lote.service";
import { IResumenLotes } from "src/app/core/models/lote/lote.model";
import { ProjectStatusGlobalService } from "src/app/core/services/project-status-global.service";

@Component({
  selector: "app-top-cards",
  templateUrl: "./top-cards.component.html",
  standalone: true,
  imports: [NgFor, CommonModule],
})
export class TopCardsComponent {
  private loteService = inject(LoteService);
  private router = inject(Router);
  private globalContext = inject(ProjectStatusGlobalService);

  public topcards: ITopcard[] = [
    { bgcolor: "primary", icon: "bi bi-boxes", title: "Total Lotes", value: 0, currentValue: 0 },
    { bgcolor: "success", icon: "bi bi-check-circle-fill", title: "Lotes Disponibles", value: 0, currentValue: 0, estadoFiltro: "DISPONIBLE" },
    { bgcolor: "warning", icon: "bi bi-bookmark-dash-fill", title: "Lotes Reservados", value: 0, currentValue: 0, estadoFiltro: "RESERVADO" },
    { bgcolor: "danger", icon: "bi bi-cart-dash-fill", title: "Lotes Vendidos", value: 0, currentValue: 0, estadoFiltro: "VENDIDO" },
  ];
  public loading = true;

  constructor() {
    effect(() => {
      const project_Id: string | null = this.globalContext.currentProjectId();
      if (project_Id) {
        this.cargarResumenLotes();
      }
    });
  }

  private cargarResumenLotes(): void {
    this.loading = true;
    this.loteService.getResumenLotes().subscribe({
      next: (resumen: IResumenLotes) => {
        // Puedes usar un casteo rápido si el servicio sigue devolviendo un tipo incorrecto
        this.topcards = [
          {
            bgcolor: "primary",
            icon: "bi bi-boxes",
            title: "Total Lotes",
            value: resumen.totalLotes,
            currentValue: 0,
          },
          {
            bgcolor: "success",
            icon: "bi bi-check-circle-fill",
            title: "Lotes Disponibles",
            value: resumen.lotesDisponibles,
            currentValue: 0,
            estadoFiltro: "DISPONIBLE",
          },
          {
            bgcolor: "warning",
            icon: "bi bi-bookmark-dash-fill",
            title: "Lotes Reservados",
            value: resumen.lotesReservados,
            currentValue: 0,
            estadoFiltro: "RESERVADO",
          },
          {
            bgcolor: "danger",
            icon: "bi bi-cart-dash-fill",
            title: "Lotes Vendidos",
            value: resumen.lotesVendidos,
            currentValue: 0,
            estadoFiltro: "VENDIDO",
          },
        ];

        this.loading = false;
        this.topcards.forEach((card) => this.animarContador(card));
      },
      error: () => {
        this.loading = false;
      },
    }); // <-- LISTO: Sin el corchete de más, cierra perfectamente el .subscribe({ ... })
  }

  /**
   * Genera un efecto fluido donde el número va aumentando progresivamente hasta el valor real
   */
  private animarContador(card: ITopcard): void {
    if (card.value === 0) return;

    const duracionMs = 1200; // Duración total de la animación en milisegundos
    const inicio = performance.now();

    const actualizarNumero = (ahora: number): void => {
      const transcurrido = ahora - inicio;
      const progreso = Math.min(transcurrido / duracionMs, 1);

      // Aplicamos una función de aceleración suave (Ease-Out)
      const progresoSuave = 1 - Math.pow(1 - progreso, 3);

      card.currentValue = Math.floor(progresoSuave * card.value);

      if (progreso < 1) {
        animationFrameScheduler.schedule(() =>
          actualizarNumero(performance.now()),
        );
      } else {
        card.currentValue = card.value; // Aseguramos el valor exacto al final
      }
    };

    animationFrameScheduler.schedule(() => actualizarNumero(performance.now()));
  }

  /**
   * Navega a la lista de lotes inyectando el estado correspondiente como queryParam
   */
  public redirigirALista(card: ITopcard): void {
    const queryParams: Record<string, string> = {};

    if (card.estadoFiltro) {
      queryParams["estado"] = card.estadoFiltro;
    }

    this.router.navigate(["/gestion-inmobiliaria/lotes"], { queryParams });
  }
}
