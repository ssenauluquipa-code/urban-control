import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { ReportFilterComponent } from "src/app/shared/components/organisms/report-filter/report-filter.component";
import { ColumnVisibilityChange } from '../tabla-previsualizacion/tabla-previsualizacion.component';

export interface IFiltroVentaCriterio {
  fechaInicio: string;
  fechaFin: string;
}

@Component({
  selector: 'app-filtro-ventas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputDateComponent, FormFieldComponent, ReportFilterComponent],
  templateUrl: './filtro-ventas.component.html',
  styleUrl: './filtro-ventas.component.scss'
})
export class FiltroVentasComponent implements OnInit, OnDestroy {
  @Input({ required: true }) columnDefs: ColDef[] = []; // Recibe la configuración de columnas
  @Output() cambioFiltro = new EventEmitter<IFiltroVentaCriterio>();
  @Output() visibilidadColumnaChange = new EventEmitter<ColumnVisibilityChange>(); // Emite el cambio de visibilidad

  public filterForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valores) => {
        this.cambioFiltro.emit({
          fechaInicio: valores.fechaInicio || '',
          fechaFin: valores.fechaFin || ''
        });
      });
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: ['']
    });
  }

  public getControl(nombre: string): FormControl {
    return this.filterForm.get(nombre) as FormControl;
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ fechaInicio: '', fechaFin: '' });
  }

  public onVisibilityChange(event: ColumnVisibilityChange): void {
    this.visibilidadColumnaChange.emit(event);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}