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
      <ng-container *ngIf="actions.length <= 2">
        <button *ngFor="let act of actions" 
                nz-button nzType="text" 
                (click)="handleAction(act)">
          <i nz-icon [nzType]="getIcon(act)"></i>
        </button>
      </ng-container>

      <ng-container *ngIf="actions.length > 2">
        <a nz-dropdown [nzDropdownMenu]="menu" nzTrigger="click">
          <i nz-icon nzType="more" style="font-size: 20px;"></i>
        </a>
        <nz-dropdown-menu #menu="nzDropdownMenu">
          <ul nz-menu>
            <li nz-menu-item *ngFor="let act of actions" (click)="handleAction(act)">
              <i nz-icon [nzType]="getIcon(act)" style="margin-right: 8px;"></i>
              {{ getLabel(act) }}
            </li>
          </ul>
        </nz-dropdown-menu>
      </ng-container>
    </div>
  `,
  styles: `
  .actions-container { display: flex; justify-content: center; align-items: center; gap: 4px; }
  `
})
export class TableActionsComponent implements ICellRendererAngularComp  {

  @Output() actionClicked = new EventEmitter<{ action: string, data: any }>();

  actions: string[] = [];
  rowData: any = null;
  params!: ITableActionParams;

  handleAction(action: string) {
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
      [TableActionsEnum.NUEVO]: 'plus'
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
      [TableActionsEnum.NUEVO]: 'Nuevo'
    };
    return labels[action] || action;
  }
  agInit(params: ITableActionParams): void {
    this.params = params;
    this.actions = params.actions || [];
    this.rowData = params.data; // Aquí están los datos de la fila
  }

  refresh(params: ITableActionParams): boolean {
    this.params = params;
    this.actions = params.actions || [];
    this.rowData = params.data;
    return true;
  }
}
