import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi, CellValueChangedEvent } from 'ag-grid-community';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';

interface RowGridStructure {
  idGrid: string;
  isExcepcion: boolean;
  parentCodigo: string;
  numero?: number;
  codigo?: string;
  descripcion?: string;
  cantidadLotes?: number;
  areaM2: number | null;
  precioReferencial: number | null;
  dimensionNorte: number | null;
  dimensionSur: number | null;
  dimensionEste: number | null;
  dimensionOeste: number | null;
  comision: number | null;
  observaciones: string;
}

@Component({
  selector: 'app-mass-load-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridModule, PageContainerComponent],
  templateUrl: './mass-load-view.component.html',
  styleUrls: ['./mass-load-view.component.scss']
})
export class MassLoadViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private proyectoService = inject(ProyectoService);
  private notification = inject(NotificationService);

  public proyectoId = '';
  public form!: FormGroup;
  private gridApi!: GridApi;
  public gridRowData: RowGridStructure[] = [];
  public loading = false;

  public columnDefs: ColDef<RowGridStructure>[] = [];

  public defaultColDef: ColDef = { 
    resizable: true, 
    sortable: false,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    minWidth: 100
  };
  public rowClassRules = {
    'urban-row-excepcion': (params: any) => params.data?.isExcepcion === true,
    'urban-row-manzana': (params: any) => params.data?.isExcepcion === false
  };

  ngOnInit(): void {
    this.columnDefs = [
      {
        headerName: 'Acciones',
        width: 100,
        pinned: 'left',
        cellRenderer: (params: any) => {
          if (!params.data) return '';
          if (!params.data.isExcepcion) {
            return `<button class="btn btn-sm btn-outline-primary fw-bold" style="padding: 0px 6px;" title="Agregar Excepción (Lote)">+</button>`;
          } else {
            return `<button class="btn btn-sm btn-outline-danger fw-bold" style="padding: 0px 8px;" title="Eliminar Excepción">x</button>`;
          }
        },
        onCellClicked: (params: any) => {
          if (params.event?.target?.tagName === 'BUTTON') {
            if (!params.data?.isExcepcion) {
              this.addExcepcionRow(params.data?.codigo);
            } else {
              this.removeRow(params.data?.idGrid);
            }
          }
        }
      },
      { 
        field: 'codigo', 
        headerName: 'Manzana (Cod)', 
        width: 130, 
        editable: (params) => params.data ? !params.data.isExcepcion : false,
        cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null
      },
      { 
        field: 'descripcion', 
        headerName: 'Descripción', 
        width: 180, 
        editable: (params) => params.data ? !params.data.isExcepcion : false,
        cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null
      },
      { 
        field: 'cantidadLotes', 
        headerName: 'Lotes (Total)', 
        width: 120, 
        editable: (params) => params.data ? !params.data.isExcepcion : false,
        cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null
      },
      { 
        field: 'numero', 
        headerName: 'Lote Nro (Excepción)', 
        width: 130, 
        editable: (params) => params.data ? params.data.isExcepcion : false,
        cellStyle: (params) => (params.data && !params.data.isExcepcion) ? { backgroundColor: '#f8f9fa', fontWeight: 'normal' } : { backgroundColor: '#e6f7ff', fontWeight: 'bold' }
      },
      { field: 'areaM2', headerName: 'Área (m²)', editable: true, width: 110 },
      { field: 'precioReferencial', headerName: 'Precio Ref. ($)', editable: true, width: 130 },
      { field: 'dimensionNorte', headerName: 'Norte (m)', editable: true, width: 100 },
      { field: 'dimensionSur', headerName: 'Sur (m)', editable: true, width: 100 },
      { field: 'dimensionEste', headerName: 'Este (m)', editable: true, width: 100 },
      { field: 'dimensionOeste', headerName: 'Oeste (m)', editable: true, width: 100 },
      { field: 'comision', headerName: 'Comisión (%)', editable: true, width: 120 },
      { field: 'observaciones', headerName: 'Observaciones', editable: true, width: 250 }
    ];

    // CAPTURA TOTAL DEL ID: Leemos el id de la url del proyecto activo
    this.proyectoId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.proyectoId) {
      this.notification.error('No se detectó un ID de proyecto válido.');
      this.router.navigate(['/gestion-inmobiliaria/proyecto']);
      return;
    }

    // Inicializamos el FormGroup que contendrá el payload estructurado
    this.form = this.fb.group({
      manzanas: this.fb.array([])
    });

    // Fila por defecto para empezar a trabajar
    this.addManzanaRow('A', 'Manzana A');
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.setGridOption('rowData', this.gridRowData);
  }

  addManzanaRow(codigo: string, descripcion: string): void {
    const nuevaManzana: RowGridStructure = {
      idGrid: Math.random().toString(36).substring(2, 10),
      isExcepcion: false,
      parentCodigo: '',
      codigo: codigo,
      descripcion: descripcion,
      cantidadLotes: undefined,
      areaM2: null,
      precioReferencial: null,
      dimensionNorte: null,
      dimensionSur: null,
      dimensionEste: null,
      dimensionOeste: null,
      comision: null,
      observaciones: ''
    };

    this.gridRowData = [...this.gridRowData, nuevaManzana];
    this.refreshGrid();
  }

  addExcepcionRow(parentCodigo: string): void {
    if (!parentCodigo) {
      this.notification.warning('La manzana debe tener un Código antes de agregar excepciones.');
      return;
    }

    const nuevaExcepcion: RowGridStructure = {
      idGrid: Math.random().toString(36).substring(2, 10),
      isExcepcion: true,
      parentCodigo: parentCodigo,
      numero: undefined,
      areaM2: null,
      precioReferencial: null,
      dimensionNorte: null,
      dimensionSur: null,
      dimensionEste: null,
      dimensionOeste: null,
      comision: null,
      observaciones: ''
    };

    // Buscamos el índice correcto para insertar: justo debajo de la manzana padre o de su última excepción
    let insertIndex = -1;
    for (let i = this.gridRowData.length - 1; i >= 0; i--) {
      const row = this.gridRowData[i];
      if ((!row.isExcepcion && row.codigo === parentCodigo) || (row.isExcepcion && row.parentCodigo === parentCodigo)) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex !== -1) {
      // Creamos un nuevo array insertando la fila en su posición correcta
      const newData = [...this.gridRowData];
      newData.splice(insertIndex + 1, 0, nuevaExcepcion);
      this.gridRowData = newData;
    } else {
      // Fallback por si acaso
      this.gridRowData = [...this.gridRowData, nuevaExcepcion];
    }
    
    this.refreshGrid();
  }

  removeRow(idGrid: string): void {
    this.gridRowData = this.gridRowData.filter(row => row.idGrid !== idGrid);
    this.refreshGrid();
  }

  private refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.gridRowData);
      this.updateParentFormGroup();
    }
  }

  onCellValueChanged(event: CellValueChangedEvent): void {
    this.updateParentFormGroup();
  }

  private updateParentFormGroup(): void {
    const manzanasPayload: any[] = [];
    const manzanasRows = this.gridRowData.filter(r => !r.isExcepcion);
    
    manzanasRows.forEach(mz => {
      // Obtenemos las excepciones que pertenecen a este código de manzana
      const excepcionesRows = this.gridRowData.filter(r => r.isExcepcion && r.parentCodigo === mz.codigo);
      
      const excepcionesPayload = excepcionesRows.map(exc => {
        const payload: any = {
          numero: Number(exc.numero) || 0,
          areaM2: Number(exc.areaM2) || 0,
          precioReferencial: Number(exc.precioReferencial) || 0,
          dimensionNorte: Number(exc.dimensionNorte) || 0,
          dimensionSur: Number(exc.dimensionSur) || 0,
          dimensionEste: Number(exc.dimensionEste) || 0,
          dimensionOeste: Number(exc.dimensionOeste) || 0,
          comision: Number(exc.comision) || 0
        };
        if (exc.observaciones && exc.observaciones.trim() !== '') {
          payload.observaciones = exc.observaciones;
        }
        return payload;
      });
        
      const manzanaPayload: any = {
        codigo: mz.codigo || '',
        descripcion: mz.descripcion || '',
        cantidadLotes: Number(mz.cantidadLotes) || 0,
        areaM2: Number(mz.areaM2) || 0,
        precioReferencial: Number(mz.precioReferencial) || 0,
        dimensionNorte: Number(mz.dimensionNorte) || 0,
        dimensionSur: Number(mz.dimensionSur) || 0,
        dimensionEste: Number(mz.dimensionEste) || 0,
        dimensionOeste: Number(mz.dimensionOeste) || 0,
        comision: Number(mz.comision) || 0,
        excepciones: excepcionesPayload
      };
      
      if (mz.observaciones && mz.observaciones.trim() !== '') {
        manzanaPayload.observaciones = mz.observaciones;
      }
      
      manzanasPayload.push(manzanaPayload);
    });

    // Guardamos en el FormGroup (o podrías guardarlo en una variable local si no usas FormGroup estricto)
    // this.form.patchValue(...) si tienes un formArray complejo.
    // Como tu JSON es directo, lo podemos guardar directo en el value final:
    this.form = this.fb.group({
      manzanas: [manzanasPayload]
    });
  }

  // BOTÓN GUARDAR ESTRUCTURA (Llamada final al endpoint)
  public guardarEstructuraMasiva(): void {
    if (this.gridRowData.filter(r => r.isExcepcion && !r.numero).length > 0) {
      this.notification.warning('Tienes excepciones agregadas sin su respectivo Número de Lote asignado.');
      return;
    }

    this.loading = true;

    // Obtenemos el payload JSON limpio generado desde la tabla
    const payload = this.form.value;

    // Ejecutamos la petición HTTP mandando el ID dinámico obtenido de la lista
    this.proyectoService.createEstructuraProyecto(this.proyectoId, payload).subscribe({
      next: (res: any) => {
        const msg = res?.message || '¡Estructura masiva de manzanas y lotes creada con éxito!';
        this.notification.success(msg);
        this.router.navigate(['/gestion-inmobiliaria/proyecto']); // Redirigimos de vuelta al listado
      },
      error: (err: any) => {
        let errorMsg = 'Ocurrió un error al procesar la carga masiva en el servidor.';
        if (err.error && err.error.message) {
          errorMsg = Array.isArray(err.error.message) ? err.error.message.join(', ') : err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
        this.notification.error(errorMsg);
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }
}
