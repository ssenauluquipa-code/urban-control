import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Router } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';

/** Celda AG Grid: badge de tipo de pago y enlace al plan si es CUOTAS. */
@Component({
  selector: 'app-venta-tipo-pago-cell',
  standalone: true,
  imports: [CommonModule, NzIconModule, BadgeEstadoComponent],
  template: `
    <div class="pago-cell-container">
      <app-badge-estado [estado]="label"></app-badge-estado>
      
      @if (isCuotas) {
        <button 
          type="button"
          class="btn-icon-pure" 
          (click)="verPlanDePagos($event)"
          title="Ver plan de pagos"
        >
          <i nz-icon nzType="file-text" nzTheme="outline"></i>
        </button>
      }
    </div>
  `,
  styles: [`
    .pago-cell-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      height: 100%;
    }

    .btn-icon-pure {
      border: none;
      background: transparent;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #9c4221;
      opacity: 0.8;
      border-radius: 4px;
    }

    .btn-icon-pure:hover {
      opacity: 1;
      background-color: rgba(156, 66, 33, 0.08);
      transform: translateY(-1px);
    }

    .btn-icon-pure i {
      font-size: 16px;
    }
  `]
})
export class VentaTipoPagoCellComponent implements ICellRendererAngularComp {
  private router = inject(Router);
  params!: ICellRendererParams;
  label = '';
  cssClass = '';
  isCuotas = false;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.updateState(params.value);
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    this.updateState(params.value);
    return true;
  }

  private updateState(value: string): void {
    this.label = value || '-';
    this.isCuotas = value === 'CUOTAS';
    this.cssClass = value ? value.toLowerCase() : '';
  }

  /** Navega al detalle de la venta (plan de cuotas). */
  verPlanDePagos(event: MouseEvent): void {
    event.stopPropagation();
    
    const id = this.params.data?.ventaId;
    
    if (id) {
      this.router.navigate(['/ventas/detail', id]);
    }
  }
}
