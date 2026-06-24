import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Output } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzDropDownModule } from "ng-zorro-antd/dropdown";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import {
  ITableActionParams,
  TableActionsEnum,
} from "../../../interfaces/table-actions.interface";
import { AccessControlService } from "src/app/core/services/access-control.service";
import { AuthService } from "src/app/core/services/auth.service";
import { EAppModule, EAppAction } from "src/app/core/config/permissions.enum";
import { inject } from "@angular/core";

@Component({
  selector: "app-table-actions",
  standalone: true,
  imports: [
    CommonModule,
    NzDropDownModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
  ],
  template: `
    <div class="actions-container">
      @if (actions.length <= 2) {
        @for (act of actions; track act) {
          <button
            nz-button
            nzType="text"
            (click)="handleAction(act, $event)"
            nz-tooltip
            [title]="getLabel(act)"
          >
            <i nz-icon [nzType]="getIcon(act)"></i>
          </button>
        }
      }

      @if (actions.length > 2) {
        <a
          nz-dropdown
          [nzDropdownMenu]="menu"
          nzTrigger="click"
          tabindex="0"
          (click)="stopBubble($event)"
          (keydown.enter)="stopBubble($event)"
        >
          <i nz-icon nzType="more" style="font-size: 20px;"></i>
        </a>
        <nz-dropdown-menu #menu="nzDropdownMenu">
          <ul nz-menu>
            @for (act of actions; track act) {
              <li
                nz-menu-item
                (click)="handleAction(act, $event)"
                (keydown.enter)="handleAction(act)"
                (keydown.space)="handleAction(act)"
                tabindex="0"
              >
                <i
                  nz-icon
                  [nzType]="getIcon(act)"
                  style="margin-right: 8px;"
                ></i>
                {{ getLabel(act) }}
              </li>
            }
          </ul>
        </nz-dropdown-menu>
      }
    </div>
  `,
  styles: `
    .actions-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
    }
  `,
})
export class TableActionsComponent implements ICellRendererAngularComp {
  @Output() actionClicked = new EventEmitter<{
    action: string;
    data: unknown;
  }>();

  private access = inject(AccessControlService);
  private authService = inject(AuthService);

  actions: string[] = [];
  rowData: unknown = null;
  params!: ITableActionParams & { module?: string };
  module = "";
  private isHandling = false; // Previene doble disparo por clic rápido

  handleAction(action: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    // Prevenir doble apertura por clics rápidos
    if (this.isHandling) return;
    this.isHandling = true;
    setTimeout(() => (this.isHandling = false), 500);

    if (this.params && this.params.actionClicked) {
      this.params.actionClicked({ action, data: this.rowData });
    }
  }

  stopBubble(event: Event) {
    event.stopPropagation();
  }

  getIcon(action: string): string {
    const icons: Record<string, string> = {
      [TableActionsEnum.VIEW]: "eye",
      [TableActionsEnum.EDIT]: "edit",
      [TableActionsEnum.DELETE]: "delete",
      [TableActionsEnum.INFO]: "info-circle",
      [TableActionsEnum.ANULAR]: "stop",
      [TableActionsEnum.NUEVO]: "plus",
      [TableActionsEnum.ACTIVATE]: "check-circle",
      [TableActionsEnum.DEACTIVATE]: "close-circle",
      [TableActionsEnum.REMOVE_IMAGE]: "file-excel",
      [TableActionsEnum.UPLOAD_PHOTO]: "upload",
      [TableActionsEnum.BLOQUEADO]: "lock",
      [TableActionsEnum.SET_AVAILABLE]: "unlock",
      [TableActionsEnum.VENTA]: "shopping-cart",
      [TableActionsEnum.MASS_LOAD]: "appstore-add",
      [TableActionsEnum.COMPROBANTE]: "file-pdf",
      [TableActionsEnum.PAGO]: "credit-card",
      [TableActionsEnum.PLAN_CUENTAS]: "file-text",
      [TableActionsEnum.DEVOLUCION]: "file-word",
      [TableActionsEnum.IMPRIMIR_RECIBO]: "printer",
      [TableActionsEnum.MANZANAS]: "area-chart",
      [TableActionsEnum.LOTES]: "folder",
      [TableActionsEnum.CONTRATOS]: "file-done",
    };
    return icons[action] || "question";
  }

  getLabel(action: string): string {
    const labels: Record<string, string> = {
      [TableActionsEnum.VIEW]: "Ver",
      [TableActionsEnum.EDIT]: "Editar",
      [TableActionsEnum.DELETE]: "Eliminar",
      [TableActionsEnum.ANULAR]: "Anular",
      [TableActionsEnum.NUEVO]: "Nuevo",
      [TableActionsEnum.ACTIVATE]: "Activar",
      [TableActionsEnum.DEACTIVATE]: "Desactivar",
      [TableActionsEnum.REMOVE_IMAGE]: "Quitar Foto",
      [TableActionsEnum.UPLOAD_PHOTO]: "Subir Foto",
      [TableActionsEnum.BLOQUEADO]: "Bloquear",
      [TableActionsEnum.SET_AVAILABLE]: "Disponible",
      [TableActionsEnum.VENTA]: "Venta",
      [TableActionsEnum.MASS_LOAD]: "Carga Masiva",
      [TableActionsEnum.COMPROBANTE]: "Comprob",
      [TableActionsEnum.PAGO]: "Pago",
      [TableActionsEnum.PLAN_CUENTAS]: "Plan cuentas",
      [TableActionsEnum.DEVOLUCION]: "Devolución",
      [TableActionsEnum.IMPRIMIR_RECIBO]: "Imprimir Recibo",
      [TableActionsEnum.MANZANAS]: "Manzanas",
      [TableActionsEnum.LOTES]: "Lotes",
      [TableActionsEnum.CONTRATOS]: "Contratos",
    };
    return labels[action] || action;
  }

  agInit(params: ITableActionParams & { module?: string }): void {
    this.params = params;
    this.rowData = params.data;
    this.module = params.module || "";
    this.actions = this.filterActions((params.actions as string[]) || []);
  }

  refresh(params: ITableActionParams & { module?: string }): boolean {
    this.params = params;
    this.rowData = params.data;
    this.module = params.module || "";
    this.actions = this.filterActions((params.actions as string[]) || []);
    return true;
  }

  private filterActions(actions: string[]): string[] {
    const data = this.rowData as {
      isActive?: boolean;
      avatarUrl?: string;
      estado?: string;
      tipoPago?: string;
      saldoPendiente?: number;
      asesorId?: string;
    };

    // 1. Filtramos por permisos
    //const user = this.access['auth'].currentUser();
    //const role = user?.role;

    const allowedActions = actions.filter((action) => {
      if (!this.module) return true;

      // Para el módulo RESERVAS y VENTAS, permitimos evaluar DELETE a nivel de negocio sin restricciones
      if (
        (this.module === EAppModule.RESERVAS ||
          this.module === EAppModule.VENTAS) &&
        action === TableActionsEnum.DELETE
      ) {
        return true;
      }

      const appAction = this.mapToAppAction(action);
      const can = this.access.can(this.module as EAppModule, appAction);

      // Log de diagnóstico (puedes borrarlo después)
      /* if (this.module === 'LOTES' && action === 'edit') {
        console.log(`[TableActions] Lotes Edit Check: Role=${role}, Module=${this.module}, Action=${action} -> ${can ? '✅' : '🚫'}`);
      } */

      return can;
    });

    // 2. Filtramos por estado de negocio
    // 2. Filtramos por jerarquía de roles (Regla Especial: Nadie toca al SUPER_ADMIN)
    const currentModule = this.module as EAppModule;
    const finalActions = allowedActions.filter((action) => {
      // Si el módulo es Usuarios y la fila es un SUPER_ADMIN, ocultamos acciones de escritura
      if (
        currentModule === EAppModule.USUARIOS &&
        (data as Record<string, unknown>)?.["role"] === "SUPER_ADMIN"
      ) {
        if (
          action !== TableActionsEnum.VIEW &&
          action !== TableActionsEnum.INFO
        ) {
          return false;
        }
      }

      // Regla de Negocio: En Reservas, el botón de eliminar solo aparece si la reserva está CANCELADA
      if (
        currentModule === EAppModule.RESERVAS &&
        action === TableActionsEnum.DELETE
      ) {
        return data?.estado === "CANCELADA";
      }

      // Regla de Negocio: En Reservas, el botón de Venta solo aparece si la reserva está ACTIVA
      if (
        currentModule === EAppModule.RESERVAS &&
        action === TableActionsEnum.VENTA
      ) {
        return data?.estado === "ACTIVA";
      }

      // Regla de Negocio: En Reservas, el botón de Anular solo aparece si la reserva está ACTIVA y el usuario es el dueño (asesor) o admin
      if (
        currentModule === EAppModule.RESERVAS &&
        action === TableActionsEnum.ANULAR
      ) {
        const currentUser = this.authService.currentUser();
        const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
        const isOwner = data?.asesorId === currentUser?.asesorId;
        const isActiva = data?.estado === "ACTIVA";

        return isActiva && (isOwner || isAdmin);
      }

      // Regla de Negocio: En Lotes, el botón de eliminar solo aparece si el lote está DISPONIBLE
      if (
        currentModule === EAppModule.LOTES &&
        action === TableActionsEnum.DELETE
      ) {
        return data?.estado === "DISPONIBLE";
      }

      // Regla de Negocio: En Ventas, el botón de eliminar solo aparece si la venta está ANULADA
      if (
        currentModule === EAppModule.VENTAS &&
        action === TableActionsEnum.DELETE
      ) {
        return data?.estado === "ANULADA";
      }

      // Regla de Negocio: En Ventas, el botón ANULAR solo aparece si la venta NO está anulada y si el asesorId coincide con el logueado
      if (
        currentModule === EAppModule.VENTAS &&
        action === TableActionsEnum.ANULAR
      ) {
        const canAnular = this.access.can(
          this.module as EAppModule,
          EAppAction.ANULAR,
        );
        const currentUser = this.authService.currentUser();
        const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
        const isOwner = data?.asesorId === currentUser?.asesorId;
        const isNotAnulada = data?.estado !== "ANULADO" && data?.estado !== "ANULADA";
        
        return isNotAnulada && canAnular && (isOwner || isAdmin);
      }

      // Regla de Negocio: En Ventas, Devolución solo sale si está ANULADA
      if (
        currentModule === EAppModule.VENTAS &&
        action === TableActionsEnum.DEVOLUCION
      ) {
        return data?.estado === "ANULADA";
      }

      // Regla de Negocio: En Ventas, Plan de Cuentas solo sale si está ACTIVA y es a CUOTAS
      if (
        currentModule === EAppModule.VENTAS &&
        action === TableActionsEnum.PLAN_CUENTAS
      ) {
        return data?.estado === "ACTIVA" && data?.tipoPago === "CUOTAS";
      }

      // Regla de Negocio: En Ventas, el botón "Pago" solo aparece si es CONTADO y está ACTIVA (y preferible si tiene saldo pendiente)
      if (
        currentModule === EAppModule.VENTAS &&
        action === TableActionsEnum.PAGO
      ) {
        const isActiva = data?.estado === "ACTIVA";
        const isContado = data?.tipoPago === "CONTADO";
        const hasSaldo =
          typeof data?.saldoPendiente === "number"
            ? data.saldoPendiente > 0
            : true;
        return isActiva && isContado && hasSaldo;
      }

      // Regla de Negocio: En Ventas, contratos solo se muestran si la venta NO está anulada
      if (
        currentModule === EAppModule.VENTAS &&
        action === TableActionsEnum.CONTRATOS
      ) {
        return data?.estado !== "ANULADO" && data?.estado !== "ANULADA";
      }

      // Regla de Negocio: En Pagos, el botón de Anular solo aparece si el pago no está anulado, el usuario tiene permiso, y es el dueño (asesor) o admin
      if (
        currentModule === EAppModule.PAGOS &&
        action === TableActionsEnum.ANULAR
      ) {
        const canAnular = this.access.can(
          this.module as EAppModule,
          EAppAction.ANULAR,
        );
        const currentUser = this.authService.currentUser();
        const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
        const isOwner = data?.asesorId === currentUser?.asesorId;
        const isNotAnulado = data?.estado !== "ANULADO" && data?.estado !== "ANULADA";

        return isNotAnulado && canAnular && (isOwner || isAdmin);
      }

      if (action === TableActionsEnum.BLOQUEADO)
        return data?.estado === "DISPONIBLE";
      if (action === TableActionsEnum.SET_AVAILABLE)
        return data?.estado === "BLOQUEADO";
      if (action === TableActionsEnum.ACTIVATE) return data?.isActive === false;
      if (action === TableActionsEnum.DEACTIVATE)
        return data?.isActive === true;
      if (
        action === TableActionsEnum.REMOVE_IMAGE ||
        action === "remove_image"
      ) {
        return !!(
          data?.avatarUrl || (data as Record<string, unknown>)?.["fotoUrl"]
        );
      }
      if (action === TableActionsEnum.UPLOAD_PHOTO || action === "upload_photo")
        return true;
      if (
        action === TableActionsEnum.ANULAR ||
        action === TableActionsEnum.VENTA
      ) {
        // Mostrar botón si el pago no está ya anulado y el usuario tiene permiso
        const canAnular = this.access.can(
          this.module as EAppModule,
          EAppAction.ANULAR,
        );
        return (
          data?.estado !== "ANULADO" && data?.estado !== "ANULADA" && canAnular
        );
      }
      return true;
    });

    return finalActions;
  }

  private mapToAppAction(action: string): EAppAction {
    switch (action) {
      case TableActionsEnum.VIEW:
        return EAppAction.VIEW;
      case TableActionsEnum.INFO:
        return EAppAction.INFO;
      case TableActionsEnum.EDIT:
        return EAppAction.EDIT;
      case TableActionsEnum.BLOQUEADO:
        return EAppAction.BLOQUEADO;
      case TableActionsEnum.SET_AVAILABLE:
        return EAppAction.SET_AVAILABLE;
      case TableActionsEnum.DELETE:
        return EAppAction.DELETE;
      case TableActionsEnum.REMOVE_IMAGE:
        return EAppAction.REMOVE_IMAGE;
      case TableActionsEnum.ANULAR:
        return EAppAction.ANULAR;
      case TableActionsEnum.ACTIVATE:
        return EAppAction.ACTIVATE;
      case TableActionsEnum.DEACTIVATE:
        return EAppAction.DEACTIVATE;
      case TableActionsEnum.UPLOAD_PHOTO:
        return EAppAction.UPLOAD_PHOTO;
      case TableActionsEnum.VENTA:
        return EAppAction.VENTA;
      case TableActionsEnum.NUEVO:
        return EAppAction.NUEVO;
      case TableActionsEnum.MASS_LOAD:
        return EAppAction.MASS_LOAD;
      case TableActionsEnum.COMPROBANTE:
        return EAppAction.COMPROBANTE;
      case TableActionsEnum.PAGO:
        return EAppAction.PAGO;
      case TableActionsEnum.PLAN_CUENTAS:
        return EAppAction.PLAN_CUENTAS;
      case TableActionsEnum.DEVOLUCION:
        return EAppAction.DEVOLUCION;
      case TableActionsEnum.CONTRATOS:
        return EAppAction.CONTRATOS;
      case TableActionsEnum.IMPRIMIR_RECIBO:
        return EAppAction.VIEW; // Usamos VIEW porque imprimir es solo lectura
      default:
        return EAppAction.VIEW;
    }
  }
}
