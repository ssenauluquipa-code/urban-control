import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-pago-icon-cell',
  standalone: true,
  imports: [NzIconModule, CommonModule, RouterModule],
  template: `<i nz-icon nzType="shopping-cart" nzTheme="outline" title="Ver venta" class="clickable-icon" (click)="onClick()"></i>`,
  styles: [`.clickable-icon { cursor: pointer; }`]
})
export class PagoIconCellComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams<any>;

  constructor(private router: Router) {}

  agInit(params: ICellRendererParams<any>): void {
    this.params = params;
  }

  refresh(_params: ICellRendererParams<any>): boolean {
    return true;
  }

  onClick(): void {
    const ventaId = this.params?.data?.ventaId;
    if (ventaId) {
      this.router.navigate(['/ventas/detail', ventaId]);
    }
  }
}
