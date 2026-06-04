import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent, GridApi, CellValueChangedEvent } from 'ag-grid-community';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';

/**
 * Interfaz que define la estructura de una fila en la grilla.
 * Puede representar tanto una Manzana (padre) como una Excepción/Lote (hijo).
 */
interface RowGridStructure {
  idGrid: string;               // ID único interno para el frontend
  isExcepcion: boolean;         // Flag para diferenciar Manzana de Excepción
  parentCodigo: string;          // Código de la manzana padre (solo para excepciones)
  numero?: number;              // Número de lote (solo para excepciones)
  codigo?: string;              // Código de manzana (solo para manzanas)
  descripcion?: string;         // Descripción de la manzana
  cantidadLotes?: number;       // Cantidad de lotes generados
  areaM2: number | null;        // Área en metros cuadrados
  precioReferencial: number | null; // Precio base
  dimensionNorte: number | null;
  dimensionSur: number | null;
  dimensionEste: number | null;
  dimensionOeste: number | null;
  comision: number | null;
  observaciones: string | null;        // Notas adicionales
}

@Component({
  selector: 'app-mass-load-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AgGridModule, PageContainerComponent],
  templateUrl: './mass-load-view.component.html',
  styleUrls: ['./mass-load-view.component.scss']
})
export class MassLoadViewComponent implements OnInit {
  // =========================================================================
  // INYECCIÓN DE DEPENDENCIAS
  // =========================================================================
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private proyectoService = inject(ProyectoService);
  private notification = inject(NotificationService);

  // =========================================================================
  // PROPIEDADES PÚBLICAS
  // =========================================================================
  /** ID del proyecto obtenido de la URL */
  public proyectoId = '';
  
  /** Formulario reactivo contenedor del payload final */
  public form!: FormGroup;
  
  /** Referencia a la API de AG Grid */
  private gridApi!: GridApi;
  
  /** Datos de las filas actuales de la grilla */
  public gridRowData: RowGridStructure[] = [];
  
  /** Estado de carga para la UI */
  public loading = false;

  /** Nombre del proyecto para mostrar en el título (dinámico) */
  public projectName = '';

  /** Configuración de columnas de AG Grid */
  public readonly columnDefs: ColDef<RowGridStructure>[] = [
    {
      headerName: 'Acciones',
      width: 130,
      pinned: 'left',
      cellRenderer: (params: any) => {
        if (!params.data) return '';
        if (params.data.isExcepcion) {
          return `<button class="btn btn-sm btn-outline-danger fw-bold" style="padding: 0px 6px;" title="Eliminar Excepción">x</button>`;
        } else {
          return `
            <button class="btn btn-sm btn-outline-primary fw-bold me-1" style="padding: 0px 6px;" title="Agregar Excepción (Lote)">+</button>
            <button class="btn btn-sm btn-outline-secondary fw-bold" style="padding: 0px 6px;" title="Eliminar Manzana">🗑</button>
          `;
        }
      },
      onCellClicked: (params: any) => {
        if (params.event?.target?.tagName === 'BUTTON') {
          const action = params.event.target.innerText.trim();
          if (action === '+') {
            this.addExcepcionRow(params.data?.codigo);
          } else if (action === 'x') {
            this.removeRow(params.data?.idGrid);
          } else if (action === '🗑') {
            this.removeManzanaCompleta(params.data?.idGrid);
          }
        }
      }
    },
    { field: 'codigo', headerName: 'Manzana (Cod)', width: 130, editable: (params) => params.data ? !params.data.isExcepcion : false, cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null },
    { field: 'descripcion', headerName: 'Descripción', width: 180, editable: (params) => params.data ? !params.data.isExcepcion : false, cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null },
    { field: 'cantidadLotes', headerName: 'Lotes (Total)', width: 95, editable: (params) => params.data ? !params.data.isExcepcion : false, cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    { field: 'numero', headerName: 'Lote Nro (Excepción)', width: 110, editable: (params) => params.data ? params.data.isExcepcion : false, cellStyle: (params) => (params.data && !params.data.isExcepcion) ? { backgroundColor: '#f8f9fa', fontWeight: 'normal' } : { backgroundColor: '#e6f7ff', fontWeight: 'bold' }, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    { field: 'areaM2', headerName: 'Área (m²)', editable: true, width: 95, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    { field: 'precioReferencial', headerName: 'Precio Ref.($)', editable: true, width: 115, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    { field: 'dimensionNorte', headerName: 'Norte (m)', editable: true, width: 100, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    { field: 'dimensionSur', headerName: 'Sur (m)', editable: true, width: 95, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    { field: 'dimensionEste', headerName: 'Este (m)', editable: true, width: 95, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    { field: 'dimensionOeste', headerName: 'Oeste (m)', editable: true, width: 95, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser },
    /* { field: 'comision', headerName: 'Comisión (%)', editable: true, width: 120, cellEditor: 'agNumberCellEditor', valueParser: this.numberParser }, */
    { field: 'observaciones', headerName: 'Observaciones', editable: true, width: 250, flex: 1 }
  ];

  /** Parser para asegurar que solo se ingresen números en la grilla */
  numberParser(params: any) {
    if (params.newValue === null || params.newValue === undefined || params.newValue === '') {
      return null;
    }
    const val = Number(params.newValue);
    // Si no es un número válido (ej. escribieron letras), devolvemos el valor anterior para revertir el cambio
    return isNaN(val) ? params.oldValue : val;
  }

  /** Configuración por defecto de columnas */
  public readonly defaultColDef: ColDef = {
    resizable: true,
    sortable: false,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    minWidth: 100
  };

  /** Reglas CSS para filas específicas */
  public readonly rowClassRules = {
    'urban-row-excepcion': (params: any) => params.data?.isExcepcion === true,
    'urban-row-manzana': (params: any) => params.data?.isExcepcion === false
  };

  // =========================================================================
  // CICLO DE VIDA
  // =========================================================================
  constructor() {
    // Inicialización básica
  }

  ngOnInit(): void {
    // 1. Obtener ID del proyecto de la URL
    this.proyectoId = this.route.snapshot.paramMap.get('id') || '';

    if (this.proyectoId) {
      // 2. Cargar nombre del proyecto para el título
      this.getNameProject();
      // 3. Inicializar formulario y agregar fila inicial
      this.form = this.fb.group({
        manzanas: [[]]
      });
      this.addManzanaRow('', '');
    } else {
      this.notification.error('No se detectó un ID de proyecto válido.');
      this.router.navigate(['/gestion-inmobiliaria/proyecto']);
    }
  }

  // =========================================================================
  // EVENTOS DE GRILLA
  // =========================================================================

  /**
   * Se ejecuta cuando la grilla de AG Grid está lista.
   * @param params Evento que contiene la instancia de la API.
   */
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.setGridOption('rowData', this.gridRowData);
  }

  /**
   * Se ejecuta cuando el valor de una celda cambia.
   * Se utiliza para mantener el formulario sincronizado.
   */
  onCellValueChanged(event: CellValueChangedEvent): void {
    this.updateParentFormGroup();
  }

  // =========================================================================
  // ACCIONES DE USUARIO (Agregar / Eliminar)
  // =========================================================================

  /**
   * Agrega una nueva fila de Manzana a la grilla.
   * Valida que la fila anterior esté completa antes de insertar.
   * @param codigo Código sugerido para la manzana.
   * @param descripcion Descripción sugerida.
   */
  addManzanaRow(codigo: string, descripcion: string): void {
    // 1. VALIDACIÓN: Buscar la última manzana en la grilla
    const lastManzanaIndex = [...this.gridRowData].reverse().findIndex(r => !r.isExcepcion);

    if (lastManzanaIndex !== -1) {
      const lastManzana = this.gridRowData[this.gridRowData.length - 1 - lastManzanaIndex];

      // 2. Verificamos campos requeridos de la manzana
      if (!lastManzana.codigo || 
          !lastManzana.descripcion || 
          !lastManzana.cantidadLotes ||
          lastManzana.areaM2 === null || lastManzana.areaM2 === undefined || String(lastManzana.areaM2).trim() === '' ||
          lastManzana.precioReferencial === null || lastManzana.precioReferencial === undefined || String(lastManzana.precioReferencial).trim() === '' ||
          lastManzana.dimensionNorte === null || lastManzana.dimensionNorte === undefined || String(lastManzana.dimensionNorte).trim() === '' ||
          lastManzana.dimensionSur === null || lastManzana.dimensionSur === undefined || String(lastManzana.dimensionSur).trim() === '' ||
          lastManzana.dimensionEste === null || lastManzana.dimensionEste === undefined || String(lastManzana.dimensionEste).trim() === '' ||
          lastManzana.dimensionOeste === null || lastManzana.dimensionOeste === undefined || String(lastManzana.dimensionOeste).trim() === '') {
        
        this.notification.warning('Debes completar todos los datos (Área, Precio, Dimensiones, etc.) de la manzana actual antes de agregar otra.');
        return;
      }

      // Verificamos que las excepciones de esa manzana también estén llenas
      const excepcionesDeManzana = this.gridRowData.filter(r => r.isExcepcion && r.parentCodigo === lastManzana.codigo);
      for (const exc of excepcionesDeManzana) {
        if (!exc.numero ||
            exc.areaM2 === null || exc.areaM2 === undefined || String(exc.areaM2).trim() === '' ||
            exc.precioReferencial === null || exc.precioReferencial === undefined || String(exc.precioReferencial).trim() === '' ||
            exc.dimensionNorte === null || exc.dimensionNorte === undefined || String(exc.dimensionNorte).trim() === '' ||
            exc.dimensionSur === null || exc.dimensionSur === undefined || String(exc.dimensionSur).trim() === '' ||
            exc.dimensionEste === null || exc.dimensionEste === undefined || String(exc.dimensionEste).trim() === '' ||
            exc.dimensionOeste === null || exc.dimensionOeste === undefined || String(exc.dimensionOeste).trim() === '') {
            
            this.notification.warning(`Debes completar todos los datos del Lote Excepción #${exc.numero || ''} antes de agregar otra manzana.`);
            return;
        }
      }
    }

    // 3. Crear nueva fila de Manzana
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

  /**
   * Agrega una nueva fila de Excepción (Lote) debajo de la manzana indicada.
   * Valida que la excepción anterior tenga Número de Lote.
   * @param parentCodigo Código de la manzana a la que pertenece la excepción.
   */
  addExcepcionRow(parentCodigo: string): void {
    if (!parentCodigo) {
      this.notification.warning('La manzana debe tener un Código antes de agregar excepciones.');
      return;
    }

    // 1. VALIDACIÓN: Verificar que la manzana padre tenga todos sus datos llenos
    const parentManzana = this.gridRowData.find(r => !r.isExcepcion && r.codigo === parentCodigo);
    if (parentManzana) {
      if (!parentManzana.descripcion || 
          !parentManzana.cantidadLotes ||
          parentManzana.areaM2 === null || parentManzana.areaM2 === undefined || String(parentManzana.areaM2).trim() === '' ||
          parentManzana.precioReferencial === null || parentManzana.precioReferencial === undefined || String(parentManzana.precioReferencial).trim() === '' ||
          parentManzana.dimensionNorte === null || parentManzana.dimensionNorte === undefined || String(parentManzana.dimensionNorte).trim() === '' ||
          parentManzana.dimensionSur === null || parentManzana.dimensionSur === undefined || String(parentManzana.dimensionSur).trim() === '' ||
          parentManzana.dimensionEste === null || parentManzana.dimensionEste === undefined || String(parentManzana.dimensionEste).trim() === '' ||
          parentManzana.dimensionOeste === null || parentManzana.dimensionOeste === undefined || String(parentManzana.dimensionOeste).trim() === '') {
        
        this.notification.warning(`Debes completar todos los datos de la manzana "${parentCodigo}" antes de agregarle excepciones.`);
        return;
      }
    }

    // 2. VALIDACIÓN: Buscar la última excepción de ESTA manzana
    const excepcionesDeEstaManzana = this.gridRowData.filter(r => r.isExcepcion && r.parentCodigo === parentCodigo);

    if (excepcionesDeEstaManzana.length > 0) {
      const ultimaExcepcion = excepcionesDeEstaManzana[excepcionesDeEstaManzana.length - 1];

      // Validar que la excepción anterior esté completamente llena
      if (!ultimaExcepcion.numero ||
          ultimaExcepcion.areaM2 === null || ultimaExcepcion.areaM2 === undefined || String(ultimaExcepcion.areaM2).trim() === '' ||
          ultimaExcepcion.precioReferencial === null || ultimaExcepcion.precioReferencial === undefined || String(ultimaExcepcion.precioReferencial).trim() === '' ||
          ultimaExcepcion.dimensionNorte === null || ultimaExcepcion.dimensionNorte === undefined || String(ultimaExcepcion.dimensionNorte).trim() === '' ||
          ultimaExcepcion.dimensionSur === null || ultimaExcepcion.dimensionSur === undefined || String(ultimaExcepcion.dimensionSur).trim() === '' ||
          ultimaExcepcion.dimensionEste === null || ultimaExcepcion.dimensionEste === undefined || String(ultimaExcepcion.dimensionEste).trim() === '' ||
          ultimaExcepcion.dimensionOeste === null || ultimaExcepcion.dimensionOeste === undefined || String(ultimaExcepcion.dimensionOeste).trim() === '') {
        
        this.notification.warning('Debes completar todos los datos del Lote Excepción anterior antes de agregar uno nuevo.');
        return;
      }
    }

    // 2. Crear nueva Excepción
    const nuevaExcepcion: RowGridStructure = {
      idGrid: Math.random().toString(36).substring(2, 10),
      isExcepcion: true,
      parentCodigo: parentCodigo,
      numero: undefined, // Usuario debe llenar
      areaM2: null,
      precioReferencial: null,
      dimensionNorte: null,
      dimensionSur: null,
      dimensionEste: null,
      dimensionOeste: null,
      comision: null,
      observaciones: ''
    };

    // 3. Insertar en la posición correcta (debajo de manzana o última excepción)
    let insertIndex = -1;
    for (let i = this.gridRowData.length - 1; i >= 0; i--) {
      const row = this.gridRowData[i];
      if ((!row.isExcepcion && row.codigo === parentCodigo) || (row.isExcepcion && row.parentCodigo === parentCodigo)) {
        insertIndex = i;
        break;
      }
    }

    if (insertIndex !== -1) {
      const newData = [...this.gridRowData];
      newData.splice(insertIndex + 1, 0, nuevaExcepcion);
      this.gridRowData = newData;
    } else {
      this.gridRowData = [...this.gridRowData, nuevaExcepcion];
    }

    this.refreshGrid();
  }

  /**
   * Elimina una fila específica (Excepción) por su ID interno.
   * @param idGrid ID único de la fila a eliminar.
   */
  removeRow(idGrid: string): void {
    this.gridRowData = this.gridRowData.filter(row => row.idGrid !== idGrid);
    this.refreshGrid();
  }

  /**
   * Elimina una Manzana y todas sus excepciones asociadas.
   * Se utiliza el idGrid interno para evitar borrar múltiples manzanas si el código está vacío.
   * @param idGrid ID de la manzana a eliminar.
   */
  removeManzanaCompleta(idGrid: string): void {
    const manzanaAEliminar = this.gridRowData.find(r => r.idGrid === idGrid && !r.isExcepcion);
    
    if (manzanaAEliminar) {
      const codigoManzana = manzanaAEliminar.codigo;
      
      this.gridRowData = this.gridRowData.filter(row => {
        // Eliminar la fila que coincide con el ID exacto de la manzana
        if (row.idGrid === idGrid) return false;
        
        // Si la manzana tenía un código, eliminar también todos sus lotes/excepciones
        if (codigoManzana && row.isExcepcion && row.parentCodigo === codigoManzana) {
          return false;
        }
        
        return true;
      });
      
      this.refreshGrid();
    }
  }

  // =========================================================================
  // MÉTODOS PRIVADOS (Helpers)
  // =========================================================================

  /**
   * Refresca visualmente la grilla y actualiza el formulario reactivo subyacente.
   */
  private refreshGrid(): void {
    if (this.gridApi) {
      this.gridApi.setGridOption('rowData', this.gridRowData);
      this.updateParentFormGroup();
    }
  }

  /**
   * Construye la estructura anidada del payload basada en la grilla plana.
   * Se ejecuta en cada cambio de celda.
   */
  private updateParentFormGroup(): void {
    const manzanasPayload: any[] = [];
    const manzanasRows = this.gridRowData.filter(r => !r.isExcepcion);

    manzanasRows.forEach(mz => {
      const excepcionesRows = this.gridRowData.filter(r => r.isExcepcion && r.parentCodigo === mz.codigo);

      const excepcionesPayload = excepcionesRows.map(exc => {
        const payload: any = {
          numero: Number(exc.numero) || 0
        };
        if (exc.areaM2 !== null && exc.areaM2 !== undefined && String(exc.areaM2).trim() !== '') payload.areaM2 = Number(exc.areaM2);
        if (exc.precioReferencial !== null && exc.precioReferencial !== undefined && String(exc.precioReferencial).trim() !== '') payload.precioReferencial = Number(exc.precioReferencial);
        if (exc.dimensionNorte !== null && exc.dimensionNorte !== undefined && String(exc.dimensionNorte).trim() !== '') payload.dimensionNorte = Number(exc.dimensionNorte);
        if (exc.dimensionSur !== null && exc.dimensionSur !== undefined && String(exc.dimensionSur).trim() !== '') payload.dimensionSur = Number(exc.dimensionSur);
        if (exc.dimensionEste !== null && exc.dimensionEste !== undefined && String(exc.dimensionEste).trim() !== '') payload.dimensionEste = Number(exc.dimensionEste);
        if (exc.dimensionOeste !== null && exc.dimensionOeste !== undefined && String(exc.dimensionOeste).trim() !== '') payload.dimensionOeste = Number(exc.dimensionOeste);
        if (exc.comision !== null && exc.comision !== undefined && String(exc.comision).trim() !== '') payload.comision = Number(exc.comision);
        if (exc.observaciones && exc.observaciones.trim() !== '') {
          payload.observaciones = exc.observaciones;
        }
        return payload;
      });

      const manzanaPayload: any = {
        codigo: mz.codigo || '',
        descripcion: mz.descripcion || '',
        cantidadLotes: Number(mz.cantidadLotes) || 0,
        precioReferencial: Number(mz.precioReferencial) || 0,
        excepciones: excepcionesPayload
      };

      if (mz.areaM2 !== null && mz.areaM2 !== undefined && String(mz.areaM2).trim() !== '') manzanaPayload.areaM2 = Number(mz.areaM2);
      if (mz.dimensionNorte !== null && mz.dimensionNorte !== undefined && String(mz.dimensionNorte).trim() !== '') manzanaPayload.dimensionNorte = Number(mz.dimensionNorte);
      if (mz.dimensionSur !== null && mz.dimensionSur !== undefined && String(mz.dimensionSur).trim() !== '') manzanaPayload.dimensionSur = Number(mz.dimensionSur);
      if (mz.dimensionEste !== null && mz.dimensionEste !== undefined && String(mz.dimensionEste).trim() !== '') manzanaPayload.dimensionEste = Number(mz.dimensionEste);
      if (mz.dimensionOeste !== null && mz.dimensionOeste !== undefined && String(mz.dimensionOeste).trim() !== '') manzanaPayload.dimensionOeste = Number(mz.dimensionOeste);
      if (mz.comision !== null && mz.comision !== undefined && String(mz.comision).trim() !== '') manzanaPayload.comision = Number(mz.comision);

      if (mz.observaciones && mz.observaciones.trim() !== '') {
        manzanaPayload.observaciones = mz.observaciones;
      }

      manzanasPayload.push(manzanaPayload);
    });

    this.form.patchValue({ manzanas: manzanasPayload });
  }

  // =========================================================================
  // API & SERVICIOS
  // =========================================================================

  /**
   * Obtiene el nombre del proyecto para personalizar el título de la vista.
   */
  getNameProject(): void {
    this.proyectoService.getProyectoById(this.proyectoId).subscribe({
      next: (name: IProyecto) => {
        if (name && name.nombre) {
          this.projectName = `- ${name.nombre}`;
        }
      },
      error: (err) => {
        console.error('No se pudo recuperar el nombre del proyecto: ', err);
      }
    });
  }

  /**
   * Guarda la estructura masiva en el servidor.
   * Realiza validaciones globales y sanitización del payload antes del envío.
   */
  guardarEstructuraMasiva(): void {
    // 1. VALIDACIÓN GLOBAL DE EXCEPCIONES
    const excepcionesRows = this.gridRowData.filter(r => r.isExcepcion);
    for (const exc of excepcionesRows) {
      if (!exc.numero ||
          exc.areaM2 === null || exc.areaM2 === undefined || String(exc.areaM2).trim() === '' ||
          exc.precioReferencial === null || exc.precioReferencial === undefined || String(exc.precioReferencial).trim() === '' ||
          exc.dimensionNorte === null || exc.dimensionNorte === undefined || String(exc.dimensionNorte).trim() === '' ||
          exc.dimensionSur === null || exc.dimensionSur === undefined || String(exc.dimensionSur).trim() === '' ||
          exc.dimensionEste === null || exc.dimensionEste === undefined || String(exc.dimensionEste).trim() === '' ||
          exc.dimensionOeste === null || exc.dimensionOeste === undefined || String(exc.dimensionOeste).trim() === '') {
        this.notification.warning(`Faltan datos numéricos en el Lote Excepción #${exc.numero || 'sin número'} de la manzana "${exc.parentCodigo}".`);
        return;
      }
    }

    // 2. VALIDACIÓN GLOBAL DE MANZANAS
    const manzanasRows = this.gridRowData.filter(r => !r.isExcepcion);

    for (const mz of manzanasRows) {
      if (!mz.codigo || mz.codigo.trim() === '') {
        this.notification.warning(`Falta datos en Manzana (Cod) en una de las manzanas.`);
        return;
      }
      if (!mz.descripcion || mz.descripcion.trim() === '') {
        this.notification.warning(`Falta la Descripción en la manzana "${mz.codigo}".`);
        return;
      }
      if (!mz.cantidadLotes || mz.cantidadLotes < 1) {
        this.notification.warning(`La cantidad de lotes en la manzana "${mz.codigo}" debe ser al menos 1.`);
        return;
      }
      if (mz.areaM2 === null || mz.areaM2 === undefined || String(mz.areaM2).trim() === '' ||
          mz.precioReferencial === null || mz.precioReferencial === undefined || String(mz.precioReferencial).trim() === '' ||
          mz.dimensionNorte === null || mz.dimensionNorte === undefined || String(mz.dimensionNorte).trim() === '' ||
          mz.dimensionSur === null || mz.dimensionSur === undefined || String(mz.dimensionSur).trim() === '' ||
          mz.dimensionEste === null || mz.dimensionEste === undefined || String(mz.dimensionEste).trim() === '' ||
          mz.dimensionOeste === null || mz.dimensionOeste === undefined || String(mz.dimensionOeste).trim() === '') {
        this.notification.warning(`Faltan datos numéricos (Área, Precio o Dimensiones) en la manzana "${mz.codigo}".`);
        return;
      }
    }

    this.loading = true;

    // 3. CONSTRUCCIÓN DEL PAYLOAD FINAL
    const manzanas: any[] = [];

    manzanasRows.forEach(m => {
      const excepcionesRows = this.gridRowData.filter(r => r.isExcepcion && r.parentCodigo === m.codigo);

      const excepcionesPayload = excepcionesRows.map(e => {
        const payload: any = { numero: e.numero ? Number(e.numero) : 0 };
        if (e.areaM2 !== null && e.areaM2 !== undefined && String(e.areaM2).trim() !== '') payload.areaM2 = Number(e.areaM2);
        if (e.precioReferencial !== null && e.precioReferencial !== undefined && String(e.precioReferencial).trim() !== '') payload.precioReferencial = Number(e.precioReferencial);
        if (e.dimensionNorte !== null && e.dimensionNorte !== undefined && String(e.dimensionNorte).trim() !== '') payload.dimensionNorte = Number(e.dimensionNorte);
        if (e.dimensionSur !== null && e.dimensionSur !== undefined && String(e.dimensionSur).trim() !== '') payload.dimensionSur = Number(e.dimensionSur);
        if (e.dimensionEste !== null && e.dimensionEste !== undefined && String(e.dimensionEste).trim() !== '') payload.dimensionEste = Number(e.dimensionEste);
        if (e.dimensionOeste !== null && e.dimensionOeste !== undefined && String(e.dimensionOeste).trim() !== '') payload.dimensionOeste = Number(e.dimensionOeste);
        if (e.comision !== 0 && e.comision !== undefined && String(e.comision).trim() !== '') payload.comision = Number(e.comision);
        if (e.observaciones && e.observaciones.trim() !== '') payload.observaciones = e.observaciones;
        return payload;
      });

      const manzanaPayload: any = {
        codigo: m.codigo || "SIN_CODIGO",
        descripcion: m.descripcion || "",
        cantidadLotes: m.cantidadLotes ? Number(m.cantidadLotes) : 0,
        precioReferencial: (m.precioReferencial !== null && m.precioReferencial !== undefined && Number(m.precioReferencial) >= 0.01)
          ? Number(m.precioReferencial)
          : 0.01,
        excepciones: excepcionesPayload
      };

      if (m.areaM2 !== null && m.areaM2 !== undefined && String(m.areaM2).trim() !== '') manzanaPayload.areaM2 = Number(m.areaM2);
      if (m.dimensionNorte !== null && m.dimensionNorte !== undefined && String(m.dimensionNorte).trim() !== '') manzanaPayload.dimensionNorte = Number(m.dimensionNorte);
      if (m.dimensionSur !== null && m.dimensionSur !== undefined && String(m.dimensionSur).trim() !== '') manzanaPayload.dimensionSur = Number(m.dimensionSur);
      if (m.dimensionEste !== null && m.dimensionEste !== undefined && String(m.dimensionEste).trim() !== '') manzanaPayload.dimensionEste = Number(m.dimensionEste);
      if (m.dimensionOeste !== null && m.dimensionOeste !== undefined && String(m.dimensionOeste).trim() !== '') manzanaPayload.dimensionOeste = Number(m.dimensionOeste);
      if (m.comision !== null && m.comision !== undefined && String(m.comision).trim() !== '') manzanaPayload.comision = Number(m.comision);
      if (m.observaciones && m.observaciones.trim() !== '') manzanaPayload.observaciones = m.observaciones;

      manzanas.push(manzanaPayload);
    });

    const payloadFinal = { manzanas };

    // 4. ENVÍO AL BACKEND
    this.proyectoService.createEstructuraProyecto(this.proyectoId, payloadFinal).subscribe({
      next: (res: any) => {
        const msg = res?.message || '¡Estructura masiva de manzanas y lotes creada con éxito!';
        this.notification.success(msg);
        this.router.navigate(['/gestion-inmobiliaria/proyecto']);
      },
      error: (err: any) => {
        this.loading = false;
        let errorMsg = 'Ocurrió un error al procesar la carga masiva.';

        if (err.error && err.error.message) {
          if (Array.isArray(err.error.message)) {
            const erroresTraducidos = err.error.message.map((msgIn: string) =>
              this.traducirMensajeErrorBackend(msgIn, payloadFinal)
            );
            errorMsg = erroresTraducidos.join('<br>');
          } else {
            errorMsg = this.traducirMensajeErrorBackend(err.error.message, payloadFinal);
          }
        }

        this.notification.error(errorMsg);
      }
    });
  }

  /**
   * Traduce mensajes de error técnicos del backend (Class Validator) a mensajes legibles para el usuario.
   * @param mensaje Mensaje crudo del backend.
   * @param payload Payload enviado para mapear índices a nombres reales.
   * @returns Mensaje formateado con contexto.
   */
  private traducirMensajeErrorBackend(mensaje: string, payload: any): string {
    const regexRuta = /manzanas\.(\d+)(?:\.excepciones\.(\d+))?\.(\w+)/;
    const match = mensaje.match(regexRuta);

    let contextoLocacion = "En el formulario";

    if (match) {
      const indexManzana = parseInt(match[1], 10);
      const indexExcepcion = match[2] ? parseInt(match[2], 10) : null;
      /* const campoOriginal = match[3]; */

      const manzanaObj = payload.manzanas[indexManzana];

      if (manzanaObj) {
        if (indexExcepcion !== null) {
          const excepcionObj = manzanaObj.excepciones[indexExcepcion];
          const nroLote = excepcionObj ? excepcionObj.numero : (indexExcepcion + 1);
          contextoLocacion = `En la <b>Manzana "${manzanaObj.codigo}"</b>, en la excepción del <b>Lote #${nroLote}</b>`;
        } else {
          contextoLocacion = `En la <b>Manzana "${manzanaObj.codigo}"</b>`;
        }
      }
    }

    if (mensaje.includes('must not be less than')) {
      const valorMinimo = mensaje.split('less than')[1]?.trim() || '0.01';
      return `${contextoLocacion}: El precio o dimensión ingresada no puede ser menor a <b>${valorMinimo}</b>.`;
    }

    if (mensaje.includes('should not be empty') || mensaje.includes('must be a string')) {
      return `${contextoLocacion}: Hay un campo obligatorio que se encuentra vacío.`;
    }

    if (mensaje.includes('must be an integer number') || mensaje.includes('must be a number')) {
      return `${contextoLocacion}: El valor ingresado debe ser un número válido.`;
    }

    return `${contextoLocacion}: ${mensaje}`;
  }
}