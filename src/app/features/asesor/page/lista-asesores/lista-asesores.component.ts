import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from "@angular/core";
import { ColDef } from "ag-grid-community";
import { BadgeEstadoComponent } from "src/app/shared/components/atoms/badge-estado/badge-estado.component";
import { finalize } from "rxjs";
import { EAsesorType, IAsesor } from "src/app/core/models/asesor/asesor.model";
import { AsesorService } from "src/app/core/services/asesor.service";
import { NotificationService } from "src/app/core/services/notification.service";
import {
  ITableActionEvent,
  TableActionsEnum,
} from "src/app/shared/interfaces/table-actions.interface";
import { EAppModule } from "src/app/core/config/permissions.enum";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { ConfirmationService } from "src/app/core/services/confirmation.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ActivatedRoute, Router } from "@angular/router";
import { AsesorDetailComponent } from "../asesor-detail/asesor-detail.component";
import { ITableFilterModel } from "src/app/shared/interfaces/table-filters.interface";
import { StatusFloatingFilterComponent } from "src/app/shared/components/organisms/status-floating-filter.component";
import { ExportPdfService } from "src/app/core/services/export-pdf.service";
import { ExportExcelService } from "src/app/core/services/export-excel.service";

@Component({
  selector: "app-lista-asesores",
  standalone: true,
  imports: [PageContainerComponent, DataTableComponent],
  templateUrl: "./lista-asesores.component.html",
  styleUrl: "./lista-asesores.component.scss",
})
export class ListaAsesoresComponent implements OnInit {
  @ViewChild(DataTableComponent) private dataTable?: DataTableComponent<IAsesor>;

  public readonly tableActionEnum = TableActionsEnum;
  public readonly EAppModule = EAppModule;

  // Data
  public asesores: IAsesor[] = [];
  public loading = false;

  // Estado local para los filtros
  private currentFilterModel: ITableFilterModel = {};
  private currentStatusFilter: boolean | undefined = undefined;

  // Column Definitions
  columnDefs: ColDef[] = [
    {
      field: "codigoAsesor",
      headerName: "Código",
      width: 100,
      minWidth: 100,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      cellStyle: { fontWeight: "bold" },
    },
    {
      field: "nombreCompleto",
      headerName: "Nombre del asesor",
      flex: 1,
      minWidth: 200,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      headerName: "Documento",
      width: 145,
      minWidth: 130,
      filter: "agTextColumnFilter",
      valueGetter: (params) => {
        const data = params.data;
        if (!data) return "";
        const tipo = data.tipoDocumento || "";
        const nro = data.nroDocumento || "";
        const comp = data.complemento ? ` ${data.complemento}` : "";
        return `${tipo} ${nro}${comp}`.trim();
      },
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "telefono",
      headerName: "Teléfono",
      width: 115,
      minWidth: 100,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
    {
      field: "direccion",
      headerName: "Dirección",
      flex: 1,
      minWidth: 200,
      filter: 'agTextColumnFilter',
    },
    {
      colId: 'isActive',
      headerName: "Estado",
      width: 105,
      minWidth: 95,
      // Usamos valueGetter para que el filtro local funcione con strings
      valueGetter: (params) => params.data?.isActive ? 'true' : 'false',
      valueFormatter: (params) => params.value === 'true' ? 'Activo' : 'Inactivo',
      cellRenderer: BadgeEstadoComponent,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      floatingFilterComponent: StatusFloatingFilterComponent,
      floatingFilterComponentParams: {
        onStatusChange: (status: boolean | undefined) => {
          this.onStatusFilterChanged(status);
        },
      },
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
    },
  ];

  // Inyecciones
  private asesorService = inject(AsesorService);
  private confirmation = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  ngOnInit(): void {
    this.loadAsesores();
  }

  loadAsesores(): void {
    this.loading = true;
    // Cargamos todos los de tipo EMPLEADO para filtrar localmente
    this.asesorService
      .getAsesores("", "", undefined, EAsesorType.EMPLEADO)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.asesores = [...data];
        },
        error: () => this.notification.error("Error al cargar asesores"),
      });
  }

  onTableAction(event: ITableActionEvent<IAsesor>): void {
    if (event.action === TableActionsEnum.EDIT) {
      this.router.navigate(["editar", event.row!.id], {
        relativeTo: this.route,
      });
    }

    if (
      event.action === TableActionsEnum.DEACTIVATE ||
      event.action === TableActionsEnum.ACTIVATE
    ) {
      const request$ = this.asesorService.toggleStatus(
        event.row!.id,
        event.row!.isActive,
      );

      this.confirmation
        .toggleStatus(
          "Asesor",
          event.row!.nombreCompleto,
          event.row!.isActive,
          request$,
        )
        .subscribe((wasSuccessful) => {
          if (wasSuccessful) {
            this.loadAsesores();
          }
        });
    }
    if (event.action === TableActionsEnum.VIEW) {
      this.openDetailModal(event.row!.id);
    }
  }

  onAddNew(): void {
    this.router.navigate(["registrar"], { relativeTo: this.route });
  }

  public exportarPDF(): void {
    let dataToExport = this.asesores;
    if (this.dataTable?.gridApi) {
      const filtered: IAsesor[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportPdfService.exportAsPdf('Gestión de Asesores', this.columnDefs, dataToExport);
  }

  public exportarExcel(): void {
    let dataToExport = this.asesores;
    if (this.dataTable?.gridApi) {
      const filtered: IAsesor[] = [];
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) filtered.push(node.data);
      });
      dataToExport = filtered;
    }
    if (dataToExport.length === 0) return;
    this.exportExcelService.exportAsExcel('Gestión de Asesores', this.columnDefs, dataToExport);
  }

  private openDetailModal(id: string): void {
    const modalRef = this.modalService.open(AsesorDetailComponent, {
      size: "lg",
      centered: true,
    });
    modalRef.componentInstance.asesorId = id;
  }

  onTableFilterChanged(filterModel: ITableFilterModel): void {
    this.currentFilterModel = filterModel;
    // En local no necesitamos llamar a executeSearch
  }

  onStatusFilterChanged(status: boolean | undefined): void {
    this.currentStatusFilter = status;
    // En local AG Grid ya maneja el filtrado mediante el StatusFloatingFilterComponent
  }

  /*
  // Método remoto comentado para referencia
  private executeSearch(): void {
    const term =
      this.currentFilterModel["nombreCompleto"]?.filter ||
      this.currentFilterModel["codigoAsesor"]?.filter ||
      "";

    const nroDocumento = this.currentFilterModel["nroDocumento"]?.filter || "";
    const active = this.currentStatusFilter;

    this.loading = true;
    this.asesorService
      .getAsesores(term, nroDocumento, active, EAsesorType.EMPLEADO)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (data) => {
          this.asesores = [...data];
        },
        error: (err) => {
          console.error("Error al filtrar asesores", err);
        },
      });
  }
  */
}
