import {
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColDef } from 'ag-grid-community';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { ILote, TEstadoLote } from 'src/app/core/models/lote/lote.model';

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
      numero: 1,
      areaM2: 125,
      precioReferencial: 25000,
      estado: TEstadoLote.DISPONIBLE,
      manzanaId: '1',
      proyectoId: '1',
      manzana: {
        id: '1',
        codigo: 'A',
        proyecto: {
          id: '1',
          nombre: 'Proyecto 1'
        }
      }
    },
    {
      id: '2',
      numero: 2,
      areaM2: 130,
      precioReferencial: 26000,
      estado: TEstadoLote.VENDIDO,
      manzanaId: '1',
      proyectoId: '1',
      manzana: {
        id: '1',
        codigo: 'A',
        proyecto: {
          id: '1',
          nombre: 'Proyecto 1'
        }
      }
    },
    {
      id: '3',
      numero: 3,
      areaM2: 135,
      precioReferencial: 27000,
      estado: TEstadoLote.RESERVADO,
      manzanaId: '1',
      proyectoId: '1',
      manzana: {
        id: '1',
        codigo: 'A',
        proyecto: {
          id: '1',
          nombre: 'Proyecto 1'
        }
      }
    },
    {
      id: '4',
      numero: 4,
      areaM2: 140,
      precioReferencial: 28000,
      estado: TEstadoLote.DISPONIBLE,
      manzanaId: '1',
      proyectoId: '1',
      manzana: {
        id: '1',
        codigo: 'A',
        proyecto: {
          id: '1',
          nombre: 'Proyecto 1'
        }
      }
    },
    {
      id: '5',
      numero: 5,
      areaM2: 145,
      precioReferencial: 29000,
      estado: TEstadoLote.BLOQUEADO,
      manzanaId: '1',
      proyectoId: '1',
      manzana: {
        id: '1',
        codigo: 'A',
        proyecto: {
          id: '1',
          nombre: 'Proyecto 1'
        }
      }
    },
  ];

  // Column Definitions: Defines the columns to be displayed
  colDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'numero', headerName: 'Nro. Lote', width: 120 },
    {
      field: 'manzana.codigo',
      headerName: 'Manzana',
      width: 100,
      valueFormatter: (params) => `Manzana ${params.value}`
    },
    {
      field: 'areaM2',
      headerName: 'Área (m²)',
      width: 100,
      valueFormatter: (params) => params.value?.toLocaleString() || '0'
    },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      cellStyle: (params) => {
        if (params.value === TEstadoLote.DISPONIBLE) {
          return { color: '#10b981', fontWeight: 'bold' };
        } else if (params.value === TEstadoLote.VENDIDO) {
          return { color: '#ef4444', fontWeight: 'bold' };
        } else if (params.value === TEstadoLote.RESERVADO) {
          return { color: '#f59e0b', fontWeight: 'bold' };
        } else if (params.value === TEstadoLote.BLOQUEADO) {
          return { color: '#6b7280', fontWeight: 'bold' };
        }
        return null;
      },
    },
    {
      field: 'precioReferencial',
      headerName: 'Precio',
      width: 130,
      valueFormatter: (params) => {
        return 'Bs ' + (params.value?.toLocaleString() || '0');
      },
    },
  ];



  onAddNewLote(): void {
    console.log('Botón Nuevo accionado desde la tabla Estado de Lotes');
    // Aquí puedes abrir tu modal o redirigir a un formulario
  }
}

