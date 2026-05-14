import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IVentaDetalle, IVentaCuota } from 'src/app/core/models/venta.model';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { CurrencyPipe, DatePipe } from '@angular/common';

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
  @Input() loading = false;

  constructor(private currencyPipe: CurrencyPipe, private datePipe: DatePipe) {}

  columnDefs: ColDef[] = [
    {
      field: 'nroCuota',
      headerName: 'Nro.',
      width: 80,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'fechaVencimiento',
      headerName: 'Vencimiento',
      flex: 1,
      valueFormatter: (params) => this.datePipe.transform(params.value, 'dd/MM/yyyy') || ''
    },
    {
      field: 'monto',
      headerName: 'Monto Cuota',
      flex: 1,
      valueFormatter: (params) => this.currencyPipe.transform(params.value, 'USD') || ''
    },
    {
      field: 'montoPagado',
      headerName: 'Pagado',
      flex: 1,
      valueFormatter: (params) => this.currencyPipe.transform(params.value, 'USD') || ''
    },
    {
      field: 'saldoPendiente',
      headerName: 'Saldo',
      flex: 1,
      cellStyle: { color: '#e74c3c', fontWeight: 'bold' },
      valueFormatter: (params) => this.currencyPipe.transform(params.value, 'USD') || ''
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 140,
      cellRenderer: BadgeEstadoComponent
    }
  ];

  get titularPrincipal(): string {
    const titular = this.venta?.clientes.find(c => c.rol === 'TITULAR');
    return titular ? titular.nombre : 'Sin titular';
  }

  get cotitulares(): string {
    const cotitulares = this.venta?.clientes.filter(c => c.rol === 'COTITULAR');
    return cotitulares && cotitulares.length > 0 
      ? cotitulares.map(c => c.nombre).join(', ') 
      : 'Ninguno';
  }
}
