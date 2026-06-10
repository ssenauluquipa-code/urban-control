import { Component, EventEmitter, OnInit, Output, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ColDef } from 'ag-grid-community';
import { ReportFilterComponent } from 'src/app/shared/components/organisms/report-filter/report-filter.component';
import { ColumnVisibilityChange } from '../tabla-previsualizacion/tabla-previsualizacion.component';

export interface IFiltroLoteCriterio {
  manzanaId: string;
  estado: string;
}

@Component({
  selector: 'app-filtro-lotes',
  standalone: true,
  // 🌟 Agregamos ReportFilterComponent aquí
  imports: [CommonModule, ReactiveFormsModule, ReportFilterComponent], 
  templateUrl: './filtro-lotes.component.html',
  styleUrl: './filtro-lotes.component.scss'
})
export class FiltroLotesComponent implements OnInit, OnDestroy {
  @Input() columnDefs: ColDef[] = []; // Recibe la definición desde la vista
  @Output() cambioFiltro = new EventEmitter<IFiltroLoteCriterio>();
  @Output() visibilidadColumnaChange = new EventEmitter<ColumnVisibilityChange>(); // Escala el cambio a la vista

  public filterForm!: FormGroup;
  private destroy$ = new Subject<void>();

  public manzanas: string[] = ['candella', 'lotes nuevo', 'M-A', 'M-B'];
  public estados: string[] = ['DISPONIBLE', 'RESERVADO', 'VENDIDO'];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valores) => {
        this.cambioFiltro.emit({
          manzanaId: valores.manzanaId || '',
          estado: valores.estado || ''
        });
      });
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      manzanaId: [''],
      estado: ['']
    });
  }

  public limpiarFiltros(): void {
    this.filterForm.reset({ manzanaId: '', estado: '' });
  }

  public onVisibilityChange(event: ColumnVisibilityChange): void {
    this.visibilidadColumnaChange.emit(event); // Reenviar el evento hacia arriba (View)
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}