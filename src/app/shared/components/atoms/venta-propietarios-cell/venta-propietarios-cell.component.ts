import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

import { IVenta, ClienteVenta } from 'src/app/core/models/venta.model';

@Component({
  selector: 'app-venta-propietarios-cell',
  standalone: true,
  imports: [CommonModule, NzPopoverModule, NzToolTipModule, NzBadgeModule],
  template: `
    @if (titular) {
      <div class="propietarios-container">
        <span class="titular-name">{{ titular.nombre }}</span>
        
        @if (cotitularesCount > 0) {
          <span class="cotitulares-badge ms-2"
                nz-popover
                [nzPopoverTitle]="popoverTitle"
                [nzPopoverContent]="popoverContent"
                nzPopoverPlacement="bottom">
            +{{ cotitularesCount }}
          </span>
        }
      </div>
    }

    <ng-template #popoverTitle>
      <div class="fw-bold text-primary">
        <i class="ph ph-users-three me-1"></i> Propietarios de la Venta
      </div>
    </ng-template>

    <ng-template #popoverContent>
      <div class="popover-list">
        <!-- Titular Section -->
        <div class="popover-item titular-item mb-2">
          <div class="small text-muted text-uppercase fw-bold mb-1" style="font-size: 10px;">Titular</div>
          <div class="d-flex align-items-center gap-2">
            <div class="role-indicator bg-success"></div>
            <span class="fw-bold text-dark">{{ titular?.nombre }}</span>
          </div>
        </div>

        <!-- Cotitulares Section -->
        @if (cotitulares.length > 0) {
          <div>
             <div class="small text-muted text-uppercase fw-bold mb-1" style="font-size: 10px;">Cotitulares</div>
             @for (cot of cotitulares; track cot.id) {
               <div class="popover-item mb-1">
                 <div class="d-flex align-items-center gap-2 ps-2">
                    <div class="role-indicator bg-primary"></div>
                    <span class="text-muted">{{ cot.nombre }}</span>
                 </div>
               </div>
             }
          </div>
        }
      </div>
    </ng-template>
  `,
  styles: [`
    .propietarios-container {
      display: flex;
      align-items: center;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .titular-name {
      max-width: calc(100% - 40px);
      white-space: nowrap;      
      text-overflow: ellipsis;
    }

    .cotitulares-badge {
      background-color: #e6f7ff;
      color: #1890ff;
      border: 1px solid #91d5ff;
      border-radius: 12px;
      padding: 0 8px;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: 20px;
      transition: all 0.3s;
      
      &:hover {
        background-color: #1890ff;
        color: white;
      }
    }

    .popover-list {
      min-width: 220px;
      max-width: 350px;
    }

    .role-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .titular-item {
      padding-bottom: 8px;
      border-bottom: 1px dashed #f0f0f0;
    }
  `]
})
export class VentaPropietariosCellComponent implements ICellRendererAngularComp {
  params!: ICellRendererParams<IVenta>;
  titular: ClienteVenta | null = null;
  cotitulares: ClienteVenta[] = [];
  cotitularesCount = 0;

  agInit(params: ICellRendererParams<IVenta>): void {
    this.params = params;
    this.processClientes();
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    this.processClientes();
    return true;
  }

  private processClientes(): void {
    const clientes = this.params?.data?.clientes || [];
    if (clientes.length > 0) {
      // Buscamos al titular
      const foundTitular = clientes.find((c: ClienteVenta) => c.rol === 'TITULAR') || clientes[0];
      this.titular = foundTitular;

      // El resto son cotitulares (usamos el id del titular encontrado localmente)
      this.cotitulares = clientes.filter((c: ClienteVenta) => c.id !== foundTitular.id);
      this.cotitularesCount = this.cotitulares.length;
    } else {
      this.titular = null;
      this.cotitulares = [];
      this.cotitularesCount = 0;
    }
  }
}
