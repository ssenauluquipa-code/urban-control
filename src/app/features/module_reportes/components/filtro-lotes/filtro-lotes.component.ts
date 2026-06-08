import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface IFiltroLoteCriterio {
  manzanaId: string;
  estado: string;
}

@Component({
  selector: 'app-filtro-lotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtro-lotes.component.html',
  styleUrl: './filtro-lotes.component.scss'
})
export class FiltroLotesComponent implements OnInit, OnDestroy {
  @Output() cambioFiltro = new EventEmitter<IFiltroLoteCriterio>();

  public filterForm!: FormGroup;
  private destroy$ = new Subject<void>();

  // Listas de control locales para los selectores (Hardcodeadas o cargadas dinámicamente)
  public manzanas: string[] = ['candella', 'lotes nuevo', 'M-A', 'M-B'];
  public estados: string[] = ['DISPONIBLE', 'RESERVADO', 'VENDIDO'];

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngOnInit(): void {
    // Escucha reactiva a cualquier cambio de los inputs del formulario
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
    this.filterForm.reset({
      manzanaId: '',
      estado: ''
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}