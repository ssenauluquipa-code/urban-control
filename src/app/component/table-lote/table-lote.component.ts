import {
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { ILote } from 'src/app/core/models/gestion-inmobiliaria/lotes.model';

@Component({
  selector: 'app-table-lote',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, DataTableComponent], // SubHeader is handled internally
  template: `
    <app-page-container
  title="Estado de Lotes - Urbanización El Mollar"
  permissionScope="lotes"
  [showNew]="true"
  [showOptions]="true"
  (onAddNew)="onAddNewLote()">

  <!-- ← REEMPLAZA tu <div #gridContainer> con esto: -->
  <app-data-table
    [rowData]="rowData"
    [columnDefs]="colDefs"
    [loading]="false"
    height="350px"
    [showCreate]="false"
    [actions]="[tableActionEnum.VIEW, tableActionEnum.EDIT, tableActionEnum.DELETE]"
    (actionClicked)="onTableAction($event)">
  </app-data-table>
</app-page-container>

  `,
  styleUrl: './table-lote.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TableLoteComponent {
  public tableActionEnum = TableActionsEnum;

  onTableAction(event: ITableActionEvent<ILote>) {
  console.log('Acción ejecutada:', event.action, 'sobre la fila:', event.row);

  if (event.action === 'edit') {
    // Lógica para editar
  }
}


  // Row Data: The data to be displayed
  rowData: ILote[] = [
    {
      id: '1',
      numeroLote: 'L-001',
      manzana: 'A',
      proyectoId: '1',
      superficieM2: 125,
      estado: 'Disponible',
      proyecto: { nombre: 'Urbanización Mollar', precioBaseM2: 200 }
    },
    {
      id: '2',
      numeroLote: 'L-002',
      manzana: 'A',
      proyectoId: '1',
      superficieM2: 130,
      estado: 'Vendido',
      proyecto: { nombre: 'Urbanización Mollar', precioBaseM2: 200 }
    },
    {
      id: '3',
      numeroLote: 'L-003',
      manzana: 'B',
      proyectoId: '1',
      superficieM2: 135,
      estado: 'Reservado',
      proyecto: { nombre: 'Urbanización Mollar', precioBaseM2: 200 }
    },
    {
      id: '4',
      numeroLote: 'L-004',
      manzana: 'B',
      proyectoId: '1',
      superficieM2: 140,
      estado: 'Disponible',
      proyecto: { nombre: 'Urbanización Mollar', precioBaseM2: 200 }
    },
    {
      id: '5',
      numeroLote: 'L-005',
      manzana: 'C',
      proyectoId: '1',
      superficieM2: 145,
      estado: 'Bloqueado',
      proyecto: { nombre: 'Urbanización Mollar', precioBaseM2: 200 }
    },
  ];

  // Column Definitions: Defines the columns to be displayed
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'numeroLote', headerName: 'Nro. Lote', width: 120 },
    {
      field: 'manzana',
      headerName: 'Manzana',
      width: 100,
      valueFormatter: (params) => `Manzana ${params.value}`
    },
    {
      field: 'superficieM2',
      headerName: 'Área (m²)',
      width: 100,
      valueFormatter: (params) => params.value.toLocaleString()
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      cellStyle: (params) => {
        if (params.value === 'Disponible') {
          return { color: '#10b981', fontWeight: 'bold' };
        } else if (params.value === 'Vendido') {
          return { color: '#ef4444', fontWeight: 'bold' };
        } else if (params.value === 'Reservado') {
          return { color: '#f59e0b', fontWeight: 'bold' };
        } else if (params.value === 'Bloqueado') {
          return { color: '#6b7280', fontWeight: 'bold' };
        }
        return null;
      },
    },
    {
      headerName: 'Precio',
      width: 130,
      valueGetter: (params) => {
        if (params.data.superficieM2 && params.data.proyecto?.precioBaseM2) {
          return params.data.superficieM2 * params.data.proyecto.precioBaseM2;
        }
        return 0;
      },
      valueFormatter: (params) => {
        return 'Bs ' + params.value.toLocaleString();
      },
    },
  ];



  onAddNewLote(): void {
    console.log('Botón Nuevo accionado desde la tabla Estado de Lotes');
    // Aquí puedes abrir tu modal o redirigir a un formulario
  }
}

