import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IClienteReporte } from 'src/app/core/models/reportes/reportes.model';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { ColumnVisibilityChange } from '../../components/tabla-previsualizacion/tabla-previsualizacion.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { SelectGenderComponent } from 'src/app/shared/components/atoms/select-gender.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';

export interface IFiltroClienteCriterio {
  busqueda: string;
  genero: string;
}

@Component({
  selector: 'app-reporte-clientes-view',
  standalone: true,
  imports: [ReactiveFormsModule, ReportFilterComponent, DataTableComponent, InputTextComponent, SelectGenderComponent, FormFieldComponent],
  templateUrl: './reporte-clientes-view.component.html',
  styleUrl: './reporte-clientes-view.component.scss'
})
export class ReporteClientesViewComponent implements OnInit, OnDestroy {

  @Input({required:true}) datos:IClienteReporte[] = [];
  @Output() cambioFiltro = new EventEmitter<IFiltroClienteCriterio>();
  @ViewChild('tablaComponent') tablaComponent!: DataTableComponent;
  public columnas: ColDef[] = [];
  public filterForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      busqueda: [''],
      genero: ['']
    });
  }

  ngOnInit(): void {
    this.configurarColumnasDeLaTabla();
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valores) => {
        this.cambioFiltro.emit({ 
          busqueda: valores.busqueda || '',
          genero: valores.genero || ''
        });
      });
  }

  public getControl(nombre: string): FormControl {
    return this.filterForm.get(nombre) as FormControl;
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ busqueda: '', genero: '' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarColumnasDeLaTabla(): void {
    this.columnas = [
      { field: 'nombreCompleto', headerName: 'Nombre Completo', minWidth: 200, sortable: true, filter: true, flex: 2 },
      { field: 'tipoDocumento', headerName: 'Tipo Doc.', minWidth: 100, sortable: true, filter: true, flex: 1 },
      { field: 'nroDocumento', headerName: 'Nro Doc.', minWidth: 120, sortable: true, filter: 'agNumberColumnFilter', flex: 1 },
      { field: 'complemento', headerName: 'Comp.', minWidth: 80, sortable: true, filter: true, hide: true },
      { field: 'telefono', headerName: 'Teléfono', minWidth: 120, sortable: true, filter: true, flex: 1 },
      { field: 'email', headerName: 'Correo Electrónico', minWidth: 180, sortable: true, filter: true, hide: true, flex: 1 },
      { field: 'direccion', headerName: 'Dirección', minWidth: 180, sortable: true, filter: true, hide: true, flex: 1 },
      { 
        field: 'fechaNacimiento', 
        headerName: 'F. Nacimiento', 
        minWidth: 130, 
        sortable: true, 
        filter: true,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-ES', { timeZone: 'UTC' }) : '',
        hide: true,
        flex: 1
      },
      { field: 'estadoCivil', headerName: 'Estado Civil', minWidth: 120, sortable: true, filter: true, hide: true },
      { field: 'genero', headerName: 'Género', minWidth: 100, sortable: true, filter: true, hide: true },
      { field: 'ocupacion', headerName: 'Ocupación', minWidth: 140, tooltipField: 'ocupacion', flex: 1 },
      { 
        field: 'fechaRegistro', 
        headerName: 'F. Registro', 
        minWidth: 130, 
        sortable: true, 
        filter: true,
        valueFormatter: params => params.value ? new Date(params.value).toLocaleDateString('es-ES') : '',
        flex: 1 
      },
      { field: 'registradoPor', headerName: 'Registrado Por', minWidth: 140, sortable: true, filter: true, hide: true }
    ];
  }

  public onCambiarVisibilidadColumnas(event: ColumnVisibilityChange): void {
    if (this.tablaComponent?.gridApi) {
      this.tablaComponent.gridApi.setColumnsVisible([event.columnId], event.visible);
      this.tablaComponent.gridApi.sizeColumnsToFit();
    }
  }

}
