import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { IVenta } from 'src/app/core/models/venta.model';
import { VentaService } from 'src/app/core/services/venta.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { FormControl } from '@angular/forms';
import { ManzanaFloatingFilterWrapperComponent } from 'src/app/shared/components/organisms/manzana-floating-filter-wrapper.component';
import { debounceTime, distinctUntilChanged, finalize, merge } from 'rxjs';
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";

@Component({
  selector: 'app-list-ventas',
  standalone: true,
  imports: [PageContainerComponent, DataTableComponent],
  templateUrl: './list-ventas.component.html',
  styleUrls: ['./list-ventas.component.scss']
})
export class ListVentasComponent implements OnInit {

  // Inyecciones[cite: 21, 22]
  private ventaService = inject(VentaService);
  private globalContext = inject(ProjectStatusGlobalService);
  private notification = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  // Estado
  public tableActionEnum = TableActionsEnum;
  public ventas: IVenta[] = [];
  public loading = false;
  public proyectoId: string | null = null;

  // Filtros Reactivos
  public termControl = new FormControl<string | null>(null);
  public manzanaControl = new FormControl<string | null>(null);

  // Definición de columnas para la tabla de ventas
  /* public columnDefs: ColDef[] = [
    {
      field: 'codigoVenta',
      headerName: 'Código',
      width: 120,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'clienteNombre',
      headerName: 'Cliente',
      flex: 2,
      minWidth: 200,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'nroDocumento',
      headerName: 'Documento',
      width: 140,
      filter: 'agTextColumnFilter',
      floatingFilter: true,
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      field: 'loteCodigo',
      headerName: 'Lote',
      width: 100,
      suppressHeaderMenuButton: true
    },
    {
      field: 'proyectoNombre',
      headerName: 'Proyecto',
      flex: 1,
      minWidth: 150,
      suppressHeaderMenuButton: true
    },
    {
      field: 'fechaVenta',
      headerName: 'Fecha',
      width: 120,
      suppressHeaderMenuButton: true
    },
    {
      field: 'precioTotal',
      headerName: 'Precio Total',
      width: 140,
      valueFormatter: (params) => this.formatCurrency(params.value),
      suppressHeaderMenuButton: true
    },
{
      field: 'estado',
      headerName: 'Estado',
      width: 130,
      cellRenderer: (params: { value: EEstadoVenta }) => this.getEstadoBadge(params.value),
      suppressHeaderMenuButton: true
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 130,
      cellRenderer: BadgeEstadoComponent,
      filter: true,
      floatingFilter: true,
      floatingFilterComponent: StatusFloatingFilterComponent,
      floatingFilterComponentParams: {
        onStatusChange: (status: boolean | undefined) => this.onStatusFilterChanged(status)
      },
      suppressFloatingFilterButton: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    }
  ]; */

  columnDefs: ColDef[] = [
    {
      field: 'nroVenta',
      headerName: 'Nro. Venta',
      width: 120,
      cellStyle: { fontWeight: 'bold' },
      filter: true,
      floatingFilter: true
    },
    {
      headerName: 'Ubicación',
      field: 'manzana',
      width: 180,
      valueGetter: (params) => {
        return params.data ? `Mza ${params.data.manzana} - Lt ${params.data.numeroLote}` : '';
      },
      filter: true,
      floatingFilter: true,
      floatingFilterComponent: ManzanaFloatingFilterWrapperComponent, // Filtro de manzana dentro de la tabla
      /* floatingFilterComponentParams: {
        proyectoId: this.proyectoId,
        onManzanaChange: (id: string | undefined) => {
          this.manzanaControl.setValue(id || null);
        }
      } as IManzanaFloatingFilterParams */
    },
    {
      field: 'clientes',
      headerName: 'Propietario(s)',
      flex: 1,
      minWidth: 250,
      /* valueFormatter: (p) => p.data?.clientes?.map((c: any) => c.nombre).join(', ') || '' */
    },
    {
      field: 'montoTotal',
      headerName: 'Total',
      width: 130,
      valueFormatter: (p) => p.data ? `${p.data.moneda} ${p.value.toLocaleString()}` : ''
    },
    {
      field: 'tipoPago',
      headerName: 'Tipo Pago',
      width: 130,
      // Aquí podrías usar tu BadgeEstadoComponent si lo adaptas para tipos de pago
    }
  ];

  ngOnInit(): void {
    // 1. Escuchar Proyecto Global
    this.globalContext.selectedProjectId$.subscribe(projectId => {
      this.proyectoId = projectId || null;
      this.manzanaControl.setValue(null, { emitEvent: false }); // Reset local

      // Actualizar params del filtro de la tabla
      if (this.columnDefs[1].floatingFilterComponentParams) {
        this.columnDefs[1].floatingFilterComponentParams.proyectoId = this.proyectoId;
      }

      if (projectId) {
        this.loadVentas();
      } else {
        this.ventas = [];
        this.cdr.detectChanges();
      }
    });
    // 2. Escuchar cambios en filtros (Termino y Manzana)[cite: 22]
    merge(
      this.termControl.valueChanges.pipe(distinctUntilChanged()),
      this.manzanaControl.valueChanges.pipe(distinctUntilChanged())
    ).pipe(
      debounceTime(400)
    ).subscribe(() => {
      this.loadVentas();
    });
  }

  loadVentas(): void {
    if (!this.proyectoId) return;

    this.loading = true;
    const term = this.termControl.value || undefined;
    const manzanaId = this.manzanaControl.value || undefined;

    this.ventaService.listarVentas(manzanaId, term)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data) => {
          this.ventas = data;
        },
        error: () => this.notification.error('Error al cargar el listado de ventas')
      });
  }

  onTableAction(event: ITableActionEvent<IVenta>): void {
    // Lógica para editar, ver info o anular venta
    console.log('Acción:', event.action, 'Data:', event.row);
  }

  onAddNew(): void {
    // Navegar a formulario de nueva venta
  }

}
