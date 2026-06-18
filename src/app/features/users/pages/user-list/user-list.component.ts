import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { Component, OnInit, ViewChild } from "@angular/core";
import { finalize, Observable, take } from "rxjs";
import { IUser } from "src/app/core/models/user.model";
import { ExportPdfService } from "src/app/core/services/export-pdf.service";
import { ExportExcelService } from "src/app/core/services/export-excel.service";
import { inject } from "@angular/core";
import {
  ITableActionEvent,
  TableActionsEnum,
} from "src/app/shared/interfaces/table-actions.interface";
import { EAppModule } from "src/app/core/config/permissions.enum";
import {
  CellClassParams,
  ColDef,
  ICellRendererParams,
} from "ag-grid-community";
import { BadgeEstadoComponent } from "src/app/shared/components/atoms/badge-estado/badge-estado.component";
import { UserService } from "src/app/core/services/user.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { NotificationService } from "src/app/core/services/notification.service";
import { NzModalModule, NzModalService } from "ng-zorro-antd/modal";
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { CommonModule } from "@angular/common";
import { UserRegisterComponent } from "../user-register.component";
import { StatusFloatingFilterComponent } from "src/app/shared/components/organisms/status-floating-filter.component";

@Component({
  selector: "app-user-list",
  standalone: true,
  imports: [
    PageContainerComponent,
    DataTableComponent,
    CommonModule,
    NzModalModule,
  ],
  template: `
    <app-page-container
      title="Gestión de Usuarios"
      [permissionScope]="EAppModule.USUARIOS"
      [showNew]="true"
      [showOptions]="true"
      (AddNew)="onAddNewUser()"
      (MenuExportPDF)="exportarPDF()"
      (MenuExportExcel)="exportarExcel()"
    >
      <!-- Eliminamos el selector de proyectos porque la lista de usuarios es global -->

      <app-data-table
        [module]="EAppModule.USUARIOS"
        [rowData]="(users$ | async) || []"
        [columnDefs]="columnDefs"
        [loading]="isLoading"
        [showCreate]="false"
        [actions]="[
          tableActionEnum.EDIT,
          tableActionEnum.ACTIVATE,
          tableActionEnum.DEACTIVATE,
          tableActionEnum.REMOVE_IMAGE,
        ]"
        (actionClicked)="onTableAction($event)"
      >
      </app-data-table>
    </app-page-container>
  `,
  styles: ``,
})
export class UserListComponent implements OnInit {
  @ViewChild(DataTableComponent) private dataTable?: DataTableComponent<IUser>;

  public readonly EAppModule = EAppModule;
  public tableActionEnum = TableActionsEnum;
  public users$!: Observable<IUser[]>;
  public isLoading = false;

  private exportPdfService = inject(ExportPdfService);
  private exportExcelService = inject(ExportExcelService);

  private isMobile = false;
  private isTablet = false;

  columnDefs: ColDef[] = [];

  private buildColumnDefs(): ColDef[] {
    return [
      {
        field: "avatarUrl",
        headerName: "",
        width: 60,
        suppressSizeToFit: true,
        cellRenderer: (params: ICellRendererParams<IUser>) => {
          const url = params.value;
          const name = params.data?.name || "U";
          if (url) {
            return `<img src="${url}" alt="avatar" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">`;
          } else {
            return `<div style="width: 35px; height: 35px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #64748b;">${name.substring(0, 2).toUpperCase()}</div>`;
          }
        },
      },
      {
        field: "name",
        headerName: "Nombre del Usuario",
        flex: 1,
        minWidth: 130,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
      },
      {
        field: "email",
        headerName: "Correo Electrónico",
        flex: 1,
        minWidth: 180,
        hide: this.isMobile,
      },
      {
        field: "contactNumber",
        headerName: "Teléfono",
        width: 115,
        hide: this.isMobile,
      },
      {
        field: "role",
        headerName: "Rol",
        width: this.isMobile ? 90 : 140,
        hide: this.isTablet && this.isMobile,
        cellStyle: (params: CellClassParams<IUser>) => {
          const styles: Record<string, string | number> = {
            fontWeight: "bold",
            fontSize: "0.8rem",
          };
          if (params.value === "SUPER_ADMIN") styles["color"] = "#dc2626";
          if (params.value === "ADMIN") styles["color"] = "#2563eb";
          if (params.value === "USER") styles["color"] = "#059669";
          return styles;
        },
        valueFormatter: (params) => {
          if (this.isMobile) {
            const roleMap: Record<string, string> = {
              SUPER_ADMIN: "S.ADM",
              ADMIN: "ADM",
              USER: "USR",
              OPERADOR: "OPR",
              EDITOR: "EDT",
            };
            return roleMap[params.value] || params.value;
          }
          return params.value;
        },
      },
      {
        field: "isActive",
        headerName: "Estado",
        width: 100,
        valueGetter: (params) => params.data?.isActive ? 'true' : 'false',
        valueFormatter: (params) => params.value === 'true' ? 'Activo' : 'Inactivo',
        cellRenderer: BadgeEstadoComponent,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        floatingFilterComponent: StatusFloatingFilterComponent,
        suppressFloatingFilterButton: true,
        suppressHeaderMenuButton: true,
        suppressHeaderFilterButton: true,
      },
    ];
  }

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private notification: NotificationService,
    private nzModal: NzModalService,
    private breakpointObserver: BreakpointObserver,
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .subscribe((state) => {
        this.isMobile =
          state.breakpoints[Breakpoints.XSmall] ||
          state.breakpoints[Breakpoints.Small];
        this.isTablet = state.breakpoints[Breakpoints.Medium];
        this.columnDefs = this.buildColumnDefs();
      });

    this.columnDefs = this.buildColumnDefs();
    this.refreshData();
  }

  refreshData() {
    this.isLoading = true;
    this.users$ = this.userService
      .getUsers()
      .pipe(finalize(() => (this.isLoading = false)));
  }

  onTableAction(event: ITableActionEvent<IUser>) {
    if (!event.row) return;

    if (event.action === TableActionsEnum.EDIT) {
      this.openModal(event.row);
    }

    if (event.action === TableActionsEnum.VIEW) {
      // Puedes implementar un modal de solo lectura si deseas
      this.openModal(event.row);
    }

    if (event.action === TableActionsEnum.DEACTIVATE) {
      this.nzModal.confirm({
        nzTitle: "¿Está seguro de desactivar este usuario?",
        nzContent: "El usuario perderá acceso al sistema inmediatamente.",
        nzOkText: "Sí, desactivar",
        nzOkDanger: true,
        nzOnOk: () => this.toggleUserStatus(event.row!.id, true),
      });
    }

    if (event.action === TableActionsEnum.ACTIVATE) {
      this.nzModal.confirm({
        nzTitle: "¿Desea reactivar este usuario?",
        nzContent: "El usuario recuperará el acceso al sistema.",
        nzOkText: "Sí, activar",
        nzOnOk: () => this.toggleUserStatus(event.row!.id, false),
      });
    }

    if (event.action === TableActionsEnum.REMOVE_IMAGE) {
      this.nzModal.confirm({
        nzTitle: "¿Eliminar avatar?",
        nzContent: "Se quitará la imagen actual del usuario.",
        nzOkText: "Sí, eliminar",
        nzOkDanger: true,
        nzOnOk: () =>
          new Promise((resolve, reject) => {
            this.userService.deleteAvatar(event.row!.id).subscribe({
              next: () => {
                this.notification.success("Avatar eliminado");
                this.refreshData();
                resolve(true);
              },
              error: (err) => {
                this.notification.error("Error al eliminar avatar");
                console.error(err);
                reject(err);
              },
            });
          }),
      });
    }
  }

  private toggleUserStatus(id: string, currentStatus: boolean) {
    return new Promise((resolve, reject) => {
      this.userService.toggleUserStatus(id, currentStatus).subscribe({
        next: () => {
          this.notification.success(
            currentStatus ? "Usuario desactivado" : "Usuario activado",
          );
          this.refreshData();
          resolve(true);
        },
        error: (err) => {
          const backendMessage = err.error?.message;

          let displayMessage = "Error al cambiar estado del usuario";

          if (typeof backendMessage === "string") {
            displayMessage = backendMessage;
          } else if (Array.isArray(backendMessage)) {
            displayMessage = backendMessage.join(", ");
          }

          this.notification.error(displayMessage);
          console.error(err);
          reject(err);
        },
      });
    });
  }

  onAddNewUser() {
    this.openModal();
  }

  public exportarPDF(): void {
    let dataToExport: IUser[] = [];
    if (this.dataTable?.gridApi) {
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) dataToExport.push(node.data);
      });
    }

    if (dataToExport.length > 0) {
      this.exportPdfService.exportAsPdf('Gestión de Usuarios', this.columnDefs, dataToExport);
    } else {
      this.users$.pipe(take(1)).subscribe(users => {
        if (!users || users.length === 0) return;
        this.exportPdfService.exportAsPdf('Gestión de Usuarios', this.columnDefs, users);
      });
    }
  }

  public exportarExcel(): void {
    let dataToExport: IUser[] = [];
    if (this.dataTable?.gridApi) {
      this.dataTable.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) dataToExport.push(node.data);
      });
    }

    if (dataToExport.length > 0) {
      this.exportExcelService.exportAsExcel('Gestión de Usuarios', this.columnDefs, dataToExport);
    } else {
      this.users$.pipe(take(1)).subscribe(users => {
        if (!users || users.length === 0) return;
        this.exportExcelService.exportAsExcel('Gestión de Usuarios', this.columnDefs, users);
      });
    }
  }

  private openModal(data?: IUser | null) {
    const modalRef = this.modalService.open(UserRegisterComponent, {
      size: "lg",
    });

    if (data) {
      modalRef.componentInstance.userData = data;
    }

    modalRef.result.then(
      (result) => {
        if (result) this.refreshData();
      },
      () => {
        // Ignorar el cierre del modal (dismiss) sin realizar ninguna acción
      },
    );
  }
}
