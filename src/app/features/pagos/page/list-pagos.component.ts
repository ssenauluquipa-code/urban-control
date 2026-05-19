import { ChangeDetectorRef, Component, inject, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ColDef, ICellRendererParams, CellClassParams } from "ag-grid-community";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";
import { finalize } from "rxjs";

import { IPagos } from "src/app/core/models/pagos.model";
import { PagosService } from "src/app/core/services/pagos.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { ConfirmationService } from "src/app/core/services/confirmation.service";
import { ProjectStatusGlobalService } from "src/app/core/services/project-status-global.service";
import { EAppModule } from "src/app/core/config/permissions.enum";
import {
  ITableActionEvent,
  TableActionsEnum,
} from "src/app/shared/interfaces/table-actions.interface";

import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { BadgeEstadoComponent } from "src/app/shared/components/atoms/badge-estado/badge-estado.component";
import { AnularPagoModalComponent } from "./anular-pago-modal.component";

@Component({
  selector: "app-list-pagos",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
  ],
  template: `
    <app-page-container
      title="Gestión de Pagos"
      [permissionScope]="EAppModule.PAGOS"
      [showNew]="true"
      (AddNew)="onAddNew()"
    >
      <app-data-table
        [module]="EAppModule.PAGOS"
        [rowData]="pagos"
        [columnDefs]="columnDefs"
        [loading]="loading"
        [showCreate]="false"
        [actions]="[
          tableActionEnum.VIEW,
          tableActionEnum.ANULAR
        ]"
        (actionClicked)="onTableAction($event)"
      >
      </app-data-table>
    </app-page-container>
  `,
  styles: ``,
})
export class ListPagosComponent implements OnInit {
  private pagosService = inject(PagosService);
  private globalContext = inject(ProjectStatusGlobalService);
  private notification = inject(NotificationService);
  private confirmation = inject(ConfirmationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);

  public tableActionEnum = TableActionsEnum;
  public readonly EAppModule = EAppModule;
  public pagos: IPagos[] = [];
  public loading = false;
  public proyectoId: string | null = null;

  columnDefs: ColDef[] = [
    {
      field: "fechaPago",
      headerName: "Fecha Pago",
      width: 130,
      valueGetter: (params) => {
        if (!params.data?.fechaPago) return "";
        const date = new Date(params.data.fechaPago);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
      sortable: true,
    },
    {
      field: "codigoPago",
      headerName: "Código",
      width: 110,
      cellStyle: { fontWeight: "bold" },
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "ventaId",
      headerName: "Referencia Venta",
      flex: 1,
      minWidth: 200,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "monto",
      headerName: "Monto",
      width: 130,
      valueFormatter: (p) =>
        p.data ? `${p.data.monedaRecibida} ${p.value.toLocaleString()}` : "",
      cellStyle: { display: "flex", "justify-content": "flex-end", "align-items": "center" },
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
    },
    {
      field: "montoRecibido",
      headerName: "Recibido",
      width: 130,
      valueFormatter: (p) =>
        p.data ? `${p.data.monedaRecibida} ${p.value.toLocaleString()}` : "",
      cellStyle: (params: CellClassParams<IPagos>) => {
        const style: Record<string, string> = { display: "flex", "justify-content": "flex-end", "align-items": "center" };
        if (params.data) {
          if (params.data.montoRecibido < params.data.monto) {
            style["color"] = "#e67e22"; // Naranja / Alerta de Pago parcial
            style["fontWeight"] = "bold";
          } else {
            style["color"] = "#2ecc71"; // Verde / Pago completo
          }
        }
        return style;
      },
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: false,
      suppressHeaderMenuButton: false,
      suppressHeaderFilterButton: false,
    },
    {
      field: "metodo",
      headerName: "Método",
      width: 120,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "estado",
      headerName: "Estado",
      width: 120,
      cellRenderer: BadgeEstadoComponent,
      filter: "agTextColumnFilter",
      floatingFilter: false,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "cantidadComprobantes",
      headerName: "Docs",
      width: 90,
      cellRenderer: (params: ICellRendererParams<IPagos>) => {
        const val = params.data?.cantidadComprobantes ?? 0;
        return val > 0
          ? `<span class="text-primary" style="font-weight: 600; display: flex; align-items: center; gap: 4px;">📎 ${val}</span>`
          : '<span class="text-muted">-</span>';
      },
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
  ];

  ngOnInit(): void {
    // Escuchar Proyecto Global para recargar pagos
    this.globalContext.selectedProjectId$.subscribe((projectId) => {
      this.proyectoId = projectId || null;
      this.loadPagos();
    });
  }

  loadPagos(): void {
    this.loading = true;

    this.pagosService
      .listarPagos()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.pagos = data;
        },
        error: () =>
          this.notification.error("Error al cargar el listado de pagos"),
      });
  }

  onTableAction(event: ITableActionEvent<IPagos>): void {
    if (event.action === TableActionsEnum.ANULAR && event.row?.pagoId) {
      if (event.row.estado === "ANULADO") {
        this.notification.warning("Este pago ya se encuentra anulado.");
        return;
      }

      const modalRef = this.modalService.open(AnularPagoModalComponent, {
        size: "md",
        backdrop: "static",
        keyboard: false,
      });

      modalRef.componentInstance.pagoId = event.row.pagoId;
      modalRef.componentInstance.codigoPago = event.row.codigoPago;

      modalRef.result
        .then((result) => {
          if (result) {
            this.loadPagos();
          }
        })
        .catch(() => undefined);
      return;
    }

    if (event.action === TableActionsEnum.VIEW && event.row?.pagoId) {
      this.router.navigate(["/pagos/detail", event.row.pagoId]);
    }
  }

  onAddNew(): void {
    this.router.navigate(["/pagos/register"]);
  }
}
