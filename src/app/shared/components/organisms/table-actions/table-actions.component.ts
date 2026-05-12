import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ITableActionParams, TableActionsEnum } from '../../../interfaces/table-actions.interface';

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

  actions: string[] = [];
  rowData: unknown = null;
  params!: ITableActionParams;
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
      [TableActionsEnum.VENTA]: 'shopping-cart'
    };
    return icons[action] || 'question';
  }

  getLabel(action: string): string {
    const labels: Record<string, string> = {
      [TableActionsEnum.VIEW]: 'Ver',
      [TableActionsEnum.EDIT]: 'Editar',
      [TableActionsEnum.DELETE]: 'Eliminar',
      [TableActionsEnum.INFO]: 'Información',
      [TableActionsEnum.ANULAR]: 'Anular',
      [TableActionsEnum.NUEVO]: 'Nuevo',
      [TableActionsEnum.ACTIVATE]: 'Activar',
      [TableActionsEnum.DEACTIVATE]: 'Desactivar',
      [TableActionsEnum.REMOVE_IMAGE]: 'Quitar Foto',
      [TableActionsEnum.UPLOAD_PHOTO]: 'Subir Foto',
      [TableActionsEnum.BLOQUEADO]: 'Bloquear',
      [TableActionsEnum.SET_AVAILABLE]: 'Disponible',
      [TableActionsEnum.VENTA]: 'Venta',
    };
    return labels[action] || action;
  }

  agInit(params: ITableActionParams): void {
    this.params = params;
    this.rowData = params.data; // Aquí están los datos de la fila
    this.actions = this.filterActions((params.actions as string[]) || []);
  }

  refresh(params: ITableActionParams): boolean {
    this.params = params;
    this.rowData = params.data;
    this.actions = this.filterActions((params.actions as string[]) || []);
    return true;
  }

  private filterActions(actions: string[]): string[] {
    const data = this.rowData as { isActive?: boolean; avatarUrl?: string, estado?: string };

    return actions.filter(action => {
      if (action === TableActionsEnum.BLOQUEADO) {
        // Solo mostramos Bloqueado si isActive es TRUE (definido en el map del componente lista)
        return data?.estado === 'DISPONIBLE';
      }
      // Solo mostramos si está BLOQUEADO
      if (action === TableActionsEnum.SET_AVAILABLE) {
        return data?.estado === 'BLOQUEADO';
      }
      // Si el usuario ya está activo, no mostramos "Activar"
      if (action === TableActionsEnum.ACTIVATE) return data?.isActive === false;
      // Si el usuario ya está inactivo, no mostramos "Desactivar"
      if (action === TableActionsEnum.DEACTIVATE) return data?.isActive === true;
      // Si no tiene foto/avatar, no mostramos "Quitar Foto"
      if (action === TableActionsEnum.REMOVE_IMAGE || action === 'remove_image') {
        return !!(data?.avatarUrl || (data as Record<string, unknown>)?.['fotoUrl']);
      }
      // Siempre mostramos "Subir Foto"
      if (action === TableActionsEnum.UPLOAD_PHOTO || action === 'upload_photo') return true;
      // 👇 Lógica específica para Anular Reservas
      if (action === TableActionsEnum.ANULAR || action === TableActionsEnum.VENTA) {
        // Solo mostramos Anular o Venta si isActive es TRUE (definido en el map del componente lista)
        return data?.isActive === true;
      }
      return true;
    });
  }
}
