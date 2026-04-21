import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ITableActionParams, TableActionsEnum } from '../../../interfaces/table-actions.interface';

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [CommonModule, NzDropDownModule, NzButtonModule, NzIconModule],
  template: `
    <div class="actions-container">
      @if (actions.length <= 2) {
        @for (act of actions; track act) {
          <button nz-button nzType="text" (click)="handleAction(act, $event)">
            <i nz-icon [nzType]="getIcon(act)"></i>
          </button>
        }
      }

      @if (actions.length > 2) {
        <a nz-dropdown [nzDropdownMenu]="menu" nzTrigger="click">
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

  handleAction(action: string, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    if (this.params && this.params.actionClicked) {
      this.params.actionClicked({ action, data: this.rowData });
    }
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
      [TableActionsEnum.REMOVE_IMAGE]: 'file-excel'
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
      [TableActionsEnum.REMOVE_IMAGE]: 'Quitar Avatar'
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
    const data = this.rowData as { isActive?: boolean; avatarUrl?: string };

    return actions.filter(action => {
      // Si el usuario ya está activo, no mostramos "Activar"
      if (action === TableActionsEnum.ACTIVATE) return data?.isActive === false;
      // Si el usuario ya está inactivo, no mostramos "Desactivar"
      if (action === TableActionsEnum.DEACTIVATE) return data?.isActive === true;
      // Si no tiene avatar, no mostramos "Quitar Avatar"
      if (action === TableActionsEnum.REMOVE_IMAGE) return !!data?.avatarUrl;
      // 👇 Lógica específica para Anular Reservas
      if (action === TableActionsEnum.ANULAR) {
        // Solo mostramos Anular si isActive es TRUE (definido en el map del componente lista)
        return data?.isActive === true;
      }
      return true;
    });
  }
}
