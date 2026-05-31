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
            this.removeManzanaCompleta(params.data?.codigo);
          }
        }
      }
    },
    { field: 'codigo', headerName: 'Manzana (Cod)', width: 130, editable: (params) => params.data ? !params.data.isExcepcion : false, cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null },
    { field: 'descripcion', headerName: 'Descripción', width: 180, editable: (params) => params.data ? !params.data.isExcepcion : false, cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null },
    { field: 'cantidadLotes', headerName: 'Lotes (Total)', width: 120, editable: (params) => params.data ? !params.data.isExcepcion : false, cellStyle: (params) => params.data?.isExcepcion ? { backgroundColor: '#f8f9fa', color: 'transparent' } : null },
    { field: 'numero', headerName: 'Lote Nro (Excepción)', width: 130, editable: (params) => params.data ? params.data.isExcepcion : false, cellStyle: (params) => (params.data && !params.data.isExcepcion) ? { backgroundColor: '#f8f9fa', fontWeight: 'normal' } : { backgroundColor: '#e6f7ff', fontWeight: 'bold' } },
    { field: 'areaM2', headerName: 'Área (m²)', editable: true, width: 110 },
    { field: 'precioReferencial', headerName: 'Precio Ref. ($)', editable: true, width: 130 },
    { field: 'dimensionNorte', headerName: 'Norte (m)', editable: true, width: 100 },
    { field: 'dimensionSur', headerName: 'Sur (m)', editable: true, width: 100 },
    { field: 'dimensionEste', headerName: 'Este (m)', editable: true, width: 100 },
    { field: 'dimensionOeste', headerName: 'Oeste (m)', editable: true, width: 100 },
    { field: 'comision', headerName: 'Comisión (%)', editable: true, width: 120 },
    { field: 'observaciones', headerName: 'Observaciones', editable: true, width: 250 }
  ];

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

      // 2. Verificamos campos requeridos por el DTO Backend
      if (!lastManzana.codigo || 
          !lastManzana.descripcion || 
          lastManzana.cantidadLotes === undefined || lastManzana.cantidadLotes < 1 ||
          lastManzana.precioReferencial === null || lastManzana.precioReferencial < 0.01) {
        
        this.notification.warning('Debes completar Código, Descripción, Cantidad de Lotes y Precio Referencial de la manzana actual antes de agregar otra.');
        return;
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

    // 1. VALIDACIÓN: Buscar la última excepción de ESTA manzana
    const excepcionesDeEstaManzana = this.gridRowData.filter(r => r.isExcepcion && r.parentCodigo === parentCodigo);

    if (excepcionesDeEstaManzana.length > 0) {
      const ultimaExcepcion = excepcionesDeEstaManzana[excepcionesDeEstaManzana.length - 1];

      // Validar campo obligatorio 'numero' según DTO LoteEstructuraExcepcionDto
      if (!ultimaExcepcion.numero || ultimaExcepcion.numero < 1) {
        this.notification.warning('Debes ingresar el Número de Lote de la excepción anterior antes de agregar otra nueva.');
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
   * Elimina una Manzana y todas sus excepciones asociadas recursivamente.
   * @param codigoManzana Código de la manzana a eliminar.
   */
  removeManzanaCompleta(codigoManzana: string): void {
    this.gridRowData = this.gridRowData.filter(row =>
      row.codigo !== codigoManzana && row.parentCodigo !== codigoManzana
    );
    this.refreshGrid();
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
    if (this.gridRowData.filter(r => r.isExcepcion && !r.numero).length > 0) {
      this.notification.warning('Tienes excepciones agregadas sin su respectivo Número de Lote asignado.');
      return;
    }

    // 2. VALIDACIÓN GLOBAL DE MANZANAS
    const manzanasRows = this.gridRowData.filter(r => !r.isExcepcion);

    for (const mz of manzanasRows) {
      if (!mz.codigo || mz.codigo.trim() === '') {
        this.notification.warning(`Falta el Código en una de las manzanas.`);
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
      if (mz.precioReferencial === null || mz.precioReferencial < 0.01) {
        this.notification.warning(`El precio referencial en la manzana "${mz.codigo}" debe ser mayor a 0.`);
        return;
      }
    }

    this.loading = true;

    // 3. CONSTRUCCIÓN DEL PAYLOAD FINAL
    const manzanas: any[] = [];

    manzanasRows.forEach(m => {
      const excepcionesRows = this.gridRowData.filter(r => r.isExcepcion && r.parentCodigo === m.codigo);

      const excepcionesPayload = excepcionesRows.map(e => ({
        numero: e.numero ? Number(e.numero) : 0,
        areaM2: e.areaM2 ? Number(e.areaM2) : 0,
        precioReferencial: (e.precioReferencial !== null && e.precioReferencial !== undefined && Number(e.precioReferencial) >= 0.01)
          ? Number(e.precioReferencial)
          : 0.01,
        dimensionNorte: e.dimensionNorte ? Number(e.dimensionNorte) : 0,
        dimensionSur: e.dimensionSur ? Number(e.dimensionSur) : 0,
        dimensionEste: e.dimensionEste ? Number(e.dimensionEste) : 0,
        dimensionOeste: e.dimensionOeste ? Number(e.dimensionOeste) : 0,
        comision: e.comision ? Number(e.comision) : 0,
        observaciones: (e.observaciones && e.observaciones.trim() !== '') ? e.observaciones : null
      }));

      manzanas.push({
        codigo: m.codigo || "SIN_CODIGO",
        descripcion: m.descripcion || "",
        cantidadLotes: m.cantidadLotes ? Number(m.cantidadLotes) : 0,
        areaM2: m.areaM2 ? Number(m.areaM2) : 0,
        precioReferencial: (m.precioReferencial !== null && m.precioReferencial !== undefined && Number(m.precioReferencial) >= 0.01)
          ? Number(m.precioReferencial)
          : 0.01,
        dimensionNorte: m.dimensionNorte ? Number(m.dimensionNorte) : 0,
        dimensionSur: m.dimensionSur ? Number(m.dimensionSur) : 0,
        dimensionEste: m.dimensionEste ? Number(m.dimensionEste) : 0,
        dimensionOeste: m.dimensionOeste ? Number(m.dimensionOeste) : 0,
        comision: m.comision ? Number(m.comision) : 0,
        observaciones: (m.observaciones && m.observaciones.trim() !== '') ? m.observaciones : null,
        excepciones: excepcionesPayload
      });
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