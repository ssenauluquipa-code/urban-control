import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from "@angular/core";
import { ColDef } from "ag-grid-community";
import { finalize } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { EAsesorType, IAsesor } from "src/app/core/models/asesor/asesor.model";
import { EAppModule } from "src/app/core/config/permissions.enum";
import { AsesorService } from "src/app/core/services/asesor.service";
import { ConfirmationService } from "src/app/core/services/confirmation.service";
import { NotificationService } from "src/app/core/services/notification.service";
import { BadgeEstadoComponent } from "src/app/shared/components/atoms/badge-estado/badge-estado.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { StatusFloatingFilterComponent } from "src/app/shared/components/organisms/status-floating-filter.component";
import {
  ITableActionEvent,
  TableActionsEnum,
} from "src/app/shared/interfaces/table-actions.interface";
import { ITableFilterModel } from "src/app/shared/interfaces/table-filters.interface";
import { AsesorDetailComponent } from "src/app/features/asesor/page/asesor-detail/asesor-detail.component";
import { RegisterPropietarioModalComponent } from "./register-propietario-modal.component";

@Component({
  selector: "app-list-propietario",
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <app-data-table
      [module]="EAppModule.ASESORES"
      [rowData]="asesores"
      [columnDefs]="columnDefs"
      [loading]="loading"
      [showCreate]="false"
      [actions]="[
        tableActionEnum.EDIT,
        tableActionEnum.DEACTIVATE,
        tableActionEnum.ACTIVATE,
        tableActionEnum.VIEW
      ]"
      height="350px"
      (actionClicked)="onTableAction($event)"
      (filterChanged)="onTableFilterChanged($event)"
    >
    </app-data-table>
  `,
  styles: ``,
})
export class ListPropietarioComponent implements OnInit, OnChanges {
  public readonly EAppModule = EAppModule;
  @Input() refreshTrigger = 0;

  public tableActionEnum = TableActionsEnum;

  public asesores: IAsesor[] = [];
  public loading = false;

  private currentFilterModel: ITableFilterModel = {};
  private currentStatusFilter: boolean | undefined = undefined;

  columnDefs: ColDef[] = [
    {
      field: "codigoAsesor",
      headerName: "Código",
      width: 80,
      filter: "agTextColumnFilter",
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      cellStyle: { fontWeight: "bold" },
    },
    {
      field: "nombreCompleto",
      headerName: "Nombre Completo del propietario",
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
      width: 160,
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
      width: 100,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    {
      field: "isActive",
      headerName: "Estado",
      width: 110,
      cellRenderer: BadgeEstadoComponent,
      filter: true,
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

  private asesorService = inject(AsesorService);
  private confirmation = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadPropietarios();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["refreshTrigger"] && !changes["refreshTrigger"].firstChange) {
      this.loadPropietarios();
    }
  }

  loadPropietarios(): void {
    this.loading = true;
    this.asesorService
      .getAsesores(undefined, undefined, undefined, EAsesorType.PROPIETARIO)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.asesores = data;
        },
        error: () => this.notification.error("Error al cargar propietarios"),
      });
  }

  onTableAction(event: ITableActionEvent<IAsesor>): void {
    /*     if (event.action === TableActionsEnum.EDIT) {
          this.router.navigate(["editar", event.row!.id], {
            relativeTo: this.route,
          });
        } */

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
          "Propietario",
          event.row!.nombreCompleto,
          event.row!.isActive,
          request$,
        )
        .subscribe((wasSuccessful) => {
          if (wasSuccessful) {
            this.loadPropietarios();
          }
        });
    }

    if (event.action === TableActionsEnum.EDIT) {
      this.openEditModal(event.row as IAsesor);
    }

    if (event.action === TableActionsEnum.VIEW) {
      this.openDetailModal(event.row!.id);
    }
  }

  private openEditModal(propietario: IAsesor): void {
    const modalRef = this.modalService.open(RegisterPropietarioModalComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.data = propietario;

    modalRef.result.then((result) => {
      if (result) {
        this.loadPropietarios();
      }
    }).catch(() => undefined);
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
    this.executeSearch();
  }

  onStatusFilterChanged(status: boolean | undefined): void {
    this.currentStatusFilter = status;
    this.executeSearch();
  }

  private executeSearch(): void {
    const term =
      this.currentFilterModel["nombreCompleto"]?.filter ||
      this.currentFilterModel["codigoAsesor"]?.filter ||
      "";

    const nroDocumento = this.currentFilterModel["nroDocumento"]?.filter || "";
    const active = this.currentStatusFilter;

    this.loading = true;
    this.asesorService
      .getAsesores(term, nroDocumento, active, EAsesorType.PROPIETARIO)
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
          console.error("Error al filtrar propietarios", err);
        },
      });
  }
}
