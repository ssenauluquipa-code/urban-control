import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { ReactiveFormsModule } from '@angular/forms';
import { IPagoDetalle } from 'src/app/core/models/pagos.model';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { CurrencyLabelComponent } from 'src/app/shared/components/atoms/currency-label/currency-label.component';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { ImageDisplayMultipleComponent } from 'src/app/shared/components/atoms/image-display-multiple/image-display-multiple.component';

@Component({
  selector: 'app-info-pagos-view',
  standalone: true,
  imports: [
    CardContainerComponent,
    InputTextInfoComponent,
    BadgeEstadoComponent,
    CurrencyLabelComponent,
    NzEmptyModule,
    NzButtonModule,
    CommonModule,
    ReactiveFormsModule,
    DataTableComponent,
    ImageDisplayMultipleComponent
  ],
  templateUrl: './info-pagos-view.component.html',
  styleUrl: './info-pagos-view.component.scss',
})
export class InfoPagosViewComponent {
  // Column definitions for aplicaciones table
  public aplicacionesCols: ColDef[] = [
    {
      headerName: 'Nro. Cuota', field: 'nroCuota', width: 100, sort: 'desc',
      sortIndex: 0,
    },
    {
      headerName: 'Vencimiento',
      field: 'fechaVencimiento',
      width: 150,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString('es-ES'),
    },
    { headerName: 'Monto Cuota', field: 'montoCuota', width: 120, valueFormatter: (params) => this.formatCurrency(params.value) },
    { headerName: 'Aplicado', field: 'montoAplicado', width: 110, valueFormatter: (params) => this.formatCurrency(params.value) },
    { headerName: 'Pagado', field: 'montoPagadoCuota', width: 110, valueFormatter: (params) => this.formatCurrency(params.value) },
    { headerName: 'Saldo Pendiente', field: 'saldoPendienteCuota', width: 130, valueFormatter: (params) => this.formatCurrency(params.value) },
    { headerName: 'Estado', field: 'estadoCuota', width: 120 },
  ];

  private formatCurrency(value: number): string {
    const moneda = this.pagoDetalle?.monedaRecibida ?? '';
    return `${moneda} ${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Recibimos el loading del padre
  private _pagoDetalle: IPagoDetalle | null = null;

  @Input()
  set pagoDetalle(val: IPagoDetalle | null) {
    this._pagoDetalle = val;
    this.updateMappedComprobantes();
  }
  get pagoDetalle(): IPagoDetalle | null {
    return this._pagoDetalle;
  }

  @Input() loading: boolean = false;
  
  mappedComprobantes: any[] = [];

  formatBytes(bytes: number, decimals = 2): string {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  /**
   * Returns the currency string with optional TC (tipo de cambio).
   * Handles possible undefined/null values safely.
   */
  formatMonedaTC(): string {
    if (!this.pagoDetalle) return '';
    const moneda = this.pagoDetalle.monedaRecibida ?? '';
    const tc = this.pagoDetalle.tipoCambio ? ` (TC: ${this.pagoDetalle.tipoCambio})` : '';
    return `${moneda}${tc}`;
  }

  private updateMappedComprobantes(): void {
    if (!this._pagoDetalle?.comprobantes) {
      this.mappedComprobantes = [];
      return;
    }
    
    this.mappedComprobantes = this._pagoDetalle.comprobantes.map(item => {
      const esPdf = item.originalName?.endsWith('.pdf') || item.mimeType === 'application/pdf';
      return {
        uid: item.id,
        name: item.originalName || 'Comprobante',
        status: 'done',
        url: item.publicUrl,
        ['thumbUrl']: esPdf ? 'assets/icons/pdf-placeholder.svg' : item.publicUrl,
        // Mock originFileObj para el preview
        originFileObj: new File([], item.originalName || 'Comprobante')
      };
    });
  }
}
