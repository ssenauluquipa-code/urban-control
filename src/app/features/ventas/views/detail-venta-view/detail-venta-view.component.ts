import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IVentaDetalle, IVentaCuota, IVentaSaldoResumen } from 'src/app/core/models/venta.model';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ILote } from 'src/app/core/models/lote/lote.model';

/** Vista de solo lectura: datos de venta, saldo y tabla de cuotas. */
@Component({
  selector: 'app-detail-venta-view',
  standalone: true,
  imports: [
    CommonModule,
    CardContainerComponent,
    InputTextInfoComponent,
    DataTableComponent
  ],
  templateUrl: './detail-venta-view.component.html',
  styleUrl: './detail-venta-view.component.scss',
  providers: [CurrencyPipe, DatePipe]
})
export class DetailVentaViewComponent {
  @Input() venta: IVentaDetalle | null = null;
  @Input() cuotas: IVentaCuota[] = [];
  @Input() saldo: IVentaSaldoResumen | null = null;
  @Input() lotes: ILote | null = null;
  @Input() loading = false;

  constructor(private currencyPipe: CurrencyPipe, private datePipe: DatePipe) { }

  columnDefs: ColDef[] = [
    {
      field: 'nroCuota',
      headerName: 'Nro.',
      width: 60,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'monto',
      headerName: 'Monto Cuota',
      flex: 1,
      minWidth: 120,
      type: 'rightAligned',
      cellStyle: { 'display': 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
      valueFormatter: (params) => this.currencyPipe.transform(params.value, this.venta?.moneda ?? 'USD') || ''
    },
    {
      field: 'montoPagado',
      headerName: 'Pagado',
      flex: 1,
      minWidth: 100,
      type: 'rightAligned',
      cellStyle: { 'display': 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
      valueFormatter: (params) => this.currencyPipe.transform(params.value, this.venta?.moneda ?? 'USD') || ''
    },
    {
      field: 'saldoPendiente',
      headerName: 'Saldo',
      flex: 1,
      minWidth: 100,
      type: 'rightAligned',
      cellStyle: (params) => ({
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'flex-end',
      'font-weight': 'bold',
      'color': params.value === 0 ? '#27ae60' : '#e74c3c'  // verde si es 0, rojo si > 0
      }),
      valueFormatter: (params) => this.currencyPipe.transform(params.value, this.venta?.moneda ?? 'USD') || ''
    },
    {
      field: 'fechaVencimiento',
      headerName: 'Vencimiento',
      flex: 1,
      minWidth: 110,
      valueFormatter: (params) => this.datePipe.transform(params.value, 'dd/MM/yyyy') || ''
    },
    {
      field: 'estado',
      headerName: 'Estado',
      flex: 1,
      minWidth: 100,
      cellRenderer: BadgeEstadoComponent
    }
  ];

  /** Nombre del propietario titular para el resumen. */
  get titularPrincipal(): string {
    const titular = this.venta?.clientes.find(c => c.rol === 'TITULAR');
    return titular ? titular.nombre : 'Sin titular';
  }

  /** Nombres de cotitulares separados por coma. */
  get cotitulares(): string {
    const cotitulares = this.venta?.clientes.filter(c => c.rol === 'COTITULAR');
    return cotitulares && cotitulares.length > 0
      ? cotitulares.map(c => c.nombre).join(', ')
      : 'Ninguno';
  }
}
