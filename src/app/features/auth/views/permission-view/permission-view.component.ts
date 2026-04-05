import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { IPermisoMatriz, IPermisoUpdate } from 'src/app/core/models/permiso.model';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from "ag-grid-angular";
import { CommonModule } from '@angular/common'; // IMPORTANTE: Para *ngIf y *ngFor

@Component({
  selector: 'app-permission-view',
  standalone: true,
  imports: [AgGridAngular, CommonModule], // Añadido CommonModule
  templateUrl: './permission-view.component.html',
  styleUrl: './permission-view.component.scss'
})
export class PermissionViewComponent implements OnChanges {
  @Input() matriz: IPermisoMatriz[] | null = [];
  @Output() onGuardar = new EventEmitter<IPermisoUpdate[]>();

  moduloSeleccionado: IPermisoMatriz | null = null;
  public gridApi!: GridApi;
  public rowData: any[] = [];
  public columnDefs: ColDef[] = [];

  //Definimos la columna base como adaptable
  private readonly baseColumnDefs: ColDef[] = [
    {
      field: 'submodulo',
      headerName: 'Submódulo',
      pinned: 'left',
      flex: 1,
      minWidth: 200
    },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    // Si la matriz cambia y ya hay un módulo seleccionado, refrescamos los datos
    if (changes['matriz'] && this.matriz && this.matriz.length > 0) {
      //escenario eslaprimera carga de la matriz
      if(!this.moduloSeleccionado){
        this.seleccionarModulo(this.matriz[0]);
      }else{
        // Actualizamos la referencia del módulo seleccionado con los nuevos datos de la matriz
        const actualizado = this.matriz.find(m => m.moduloId === this.moduloSeleccionado?.moduloId);
        if (actualizado) {
          this.moduloSeleccionado = actualizado;
          this.estructurarDatosParaGrid();
        }
      }
    }
  }

  seleccionarModulo(modulo: IPermisoMatriz) {
    this.moduloSeleccionado = modulo;
    this.estructurarDatosParaGrid();
  }

  private estructurarDatosParaGrid(): void {
    if (!this.moduloSeleccionado) return;

    const filas: any[] = [];
    const accionesUnicas = new Set<string>();

    // Procesamos submodelos del módulo seleccionado
    this.moduloSeleccionado.submodulos.forEach(sub => {
      const fila: any = {
        submodulo: sub.nombre,
        submoduloId: sub.submoduloId
      };

      sub.acciones.forEach(acc => {
        accionesUnicas.add(acc.nombrePermiso);
        fila[acc.nombrePermiso] = acc;
      });
      filas.push(fila);
    });

    // Generar columnas dinámicas
    const dinamicas: ColDef[] = Array.from(accionesUnicas).map(nombre => ({
      headerName: nombre,
      field: nombre,
      width: 70,
      flex: 1,
      resizable: false,
      cellStyle: { 'text-align': 'center' },
      cellRenderer: (params: any) => {
        const data = params.value;
        if (!data || !data.esHabilitado) {
          return `<div style="background-color: #f5f5f5; height: 100%; width: 100%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #ccc;">-</span>
                  </div>`;
        }
        return `<input type="checkbox" ${data.concedido ? 'checked' : ''} style="cursor: pointer;" />`;
      },
      onCellClicked: (params: any) => {
        const data = params.value;
        if (data && data.esHabilitado) {
          data.concedido = !data.concedido;
          this.gridApi.refreshCells({ rowNodes: [params.node], force: true });
        }
      },
    }));

    this.columnDefs = [...this.baseColumnDefs, ...dinamicas];
    this.rowData = filas;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    // Si ya teníamos un módulo seleccionado antes de que el grid cargue
    if (this.moduloSeleccionado) {
        this.estructurarDatosParaGrid();
    }
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    },100);
  }

  enviarDatos(): void {
    const cambios: IPermisoUpdate[] = [];
    if (!this.moduloSeleccionado) return;

    this.rowData.forEach(fila => {
      Object.keys(fila).forEach(key => {
        const celda = fila[key];
        // Verificamos que sea un objeto de acción con capacidadId
        if (celda && typeof celda === 'object' && celda.capacidadId > 0) {
          cambios.push({
            rolId: 1, // Esto idealmente debería venir por un @Input() rolId
            capacidadId: celda.capacidadId,
            concedido: celda.concedido
          });
        }
      });
    });

    if (cambios.length > 0) {
      this.onGuardar.emit(cambios);
    }
  }
}
