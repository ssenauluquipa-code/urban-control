import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ITableActionParams, TableActionsEnum } from '../../../interfaces/table-actions.interface';
import { AccessControlService } from 'src/app/core/services/access-control.service';
import { EAppModule, EAppAction } from 'src/app/core/config/permissions.enum';
import { inject } from '@angular/core';

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzButtonModule, NzIconModule, NzToolTipModule],
  template: `
    <div class="actions-container">
      @if (actions.length <= 2) {
        @for (act of actions; track act) {
          <button 
            nz-button 
            nzType="text" 
            (click)="handleAction(act, $event)"
            nz-tooltip
            [nzTooltipTitle]="getLabel(act)">
            <i nz-icon [nzType]="getIcon(act)"></i>
          </button>
        }
      }

      @if (actions.length > 2) {
        <a nz-dropdown [nzDropdownMenu]="menu" nzTrigger="click" tabindex="0" (click)="stopBubble($event)" (keydown.enter)="stopBubble($event)">
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
                tabindex="0">
                <i nz-icon [nzType]="getIcon(act)" style="margin-right: 8px;"></i>
                {{ getLabel(act) }}
              </li>
            }
          </ul>
        </nz-dropdown-menu>
      }
    </div>
  `,
  styles: `
  .actions-container { display: flex; justify-content: center; align-items: center; gap: 4px; }
  `
})
export class TableActionsComponent implements ICellRendererAngularComp {

  @Output() actionClicked = new EventEmitter<{ action: string, data: unknown }>();

  private access = inject(AccessControlService);

  actions: string[] = [];
  rowData: unknown = null;
  params!: ITableActionParams & { module?: string };
  module = '';
  private isHandling = false; // Previene doble disparo por clic rápido

  handleAction(action: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    // Prevenir doble apertura por clics rápidos
    if (this.isHandling) return;
    this.isHandling = true;
    setTimeout(() => this.isHandling = false, 500);

    if (this.params && this.params.actionClicked) {
      this.params.actionClicked({ action, data: this.rowData });
    }
  }

  stopBubble(event: Event) {
    event.stopPropagation();
  }

  getIcon(action: string): string {
    const icons: Record<string, string> = {
      [TableActionsEnum.VIEW]: 'eye',
      [TableActionsEnum.EDIT]: 'edit',
      [TableActionsEnum.DELETE]: 'delete',
      [TableActionsEnum.INFO]: 'info-circle',
      [TableActionsEnum.ANULAR]: 'stop',
      [TableActionsEnum.NUEVO]: 'plus',
      [TableActionsEnum.ACTIVATE]: 'check-circle',
      [TableActionsEnum.DEACTIVATE]: 'close-circle',
      [TableActionsEnum.REMOVE_IMAGE]: 'file-excel',
      [TableActionsEnum.UPLOAD_PHOTO]: 'upload',
      [TableActionsEnum.BLOQUEADO]: 'lock',
      [TableActionsEnum.SET_AVAILABLE]: 'unlock',
      [TableActionsEnum.VENTA]: 'shopping-cart',
      [TableActionsEnum.MASS_LOAD]: 'appstore-add'
    };
    return icons[action] || 'question';
  }

  getLabel(action: string): string {
    const labels: Record<string, string> = {
      [TableActionsEnum.VIEW]: 'Ver',
      [TableActionsEnum.EDIT]: 'Editar',
      [TableActionsEnum.DELETE]: 'Eliminar',
      [TableActionsEnum.ANULAR]: 'Anular',
      [TableActionsEnum.NUEVO]: 'Nuevo',
      [TableActionsEnum.ACTIVATE]: 'Activar',
      [TableActionsEnum.DEACTIVATE]: 'Desactivar',
      [TableActionsEnum.REMOVE_IMAGE]: 'Quitar Foto',
      [TableActionsEnum.UPLOAD_PHOTO]: 'Subir Foto',
      [TableActionsEnum.BLOQUEADO]: 'Bloquear',
      [TableActionsEnum.SET_AVAILABLE]: 'Disponible',
      [TableActionsEnum.VENTA]: 'Venta',
      [TableActionsEnum.MASS_LOAD]: 'Carga Masiva',
    };
    return labels[action] || action;
  }

  agInit(params: ITableActionParams & { module?: string }): void {
    this.params = params;
    this.rowData = params.data;
    this.module = params.module || '';
    this.actions = this.filterActions((params.actions as string[]) || []);
  }

  refresh(params: ITableActionParams & { module?: string }): boolean {
    this.params = params;
    this.rowData = params.data;
    this.module = params.module || '';
    this.actions = this.filterActions((params.actions as string[]) || []);
    return true;
  }

  private filterActions(actions: string[]): string[] {
    const data = this.rowData as { isActive?: boolean; avatarUrl?: string, estado?: string };

    // 1. Filtramos por permisos
    //const user = this.access['auth'].currentUser();
    //const role = user?.role;

    const allowedActions = actions.filter(action => {
      if (!this.module) return true;
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
    const finalActions = allowedActions.filter(action => {
      // Si el módulo es Usuarios y la fila es un SUPER_ADMIN, ocultamos acciones de escritura
      if (currentModule === EAppModule.USUARIOS && (data as any)?.role === 'SUPER_ADMIN') {
        if (action !== TableActionsEnum.VIEW && action !== TableActionsEnum.INFO) {
          return false;
        }
      }

      if (action === TableActionsEnum.BLOQUEADO) return data?.estado === 'DISPONIBLE';
      if (action === TableActionsEnum.SET_AVAILABLE) return data?.estado === 'BLOQUEADO';
      if (action === TableActionsEnum.ACTIVATE) return data?.isActive === false;
      if (action === TableActionsEnum.DEACTIVATE) return data?.isActive === true;
      if (action === TableActionsEnum.REMOVE_IMAGE || action === 'remove_image') {
        return !!(data?.avatarUrl || (data as Record<string, unknown>)?.['fotoUrl']);
      }
      if (action === TableActionsEnum.UPLOAD_PHOTO || action === 'upload_photo') return true;
      if (action === TableActionsEnum.ANULAR || action === TableActionsEnum.VENTA) {
        return data?.isActive === true;
      }
      return true;
    });

    return finalActions;
  }

  private mapToAppAction(action: string): EAppAction {
    switch (action) {
      case TableActionsEnum.VIEW:
      case TableActionsEnum.INFO: return EAppAction.VIEW;
      case TableActionsEnum.EDIT:
      case TableActionsEnum.BLOQUEADO:
      case TableActionsEnum.SET_AVAILABLE: return EAppAction.EDIT;
      case TableActionsEnum.DELETE:
      case TableActionsEnum.REMOVE_IMAGE: return EAppAction.DELETE;
      case TableActionsEnum.ANULAR: return EAppAction.ANULAR;
      case TableActionsEnum.ACTIVATE: return EAppAction.ACTIVATE;
      case TableActionsEnum.DEACTIVATE: return EAppAction.DEACTIVATE;
      case TableActionsEnum.UPLOAD_PHOTO: return EAppAction.UPLOAD;
      case TableActionsEnum.VENTA: return EAppAction.VENTA;
      case TableActionsEnum.NUEVO: return EAppAction.CREATE;
      case TableActionsEnum.MASS_LOAD: return EAppAction.MASS_LOAD;
      default: return EAppAction.VIEW;
    }
  }
}
