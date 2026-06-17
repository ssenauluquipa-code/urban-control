import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { IManzanaSearchResult } from 'src/app/core/models/manzana/manzana.model';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { SelectDataComponent } from './select-data.component';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-select-manzanas',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="manzanaList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="bindValue"
      [bindLabel]="'codigo'"
      [loading]="isLoading"
      (ChangeValue)="onSelect($event)"
      (SearchText)="onSearchInput($event)">
    </app-select-data>
  `
})
export class SelectManzanasComponent implements OnInit, OnDestroy {
  private readonly manzanaService = inject(ManzanaService);
  private readonly globalContext = inject(ProjectStatusGlobalService);

  // Inputs y Outputs estrictos sin rastro de proyectoId redundantes
  @Input() inputControl = new FormControl<string | null>(null);
  @Input() placeholder: string = 'Seleccione manzana';
  @Input() bindValue: string = 'id';
  @Output() Change = new EventEmitter<string | null>();

  // Estado local alineado a tu Swagger
  public manzanaList: IManzanaSearchResult[] = [];
  public isLoading: boolean = false;

  private readonly searchSubject$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  private previousProjectId: string | null = null;

  // Convertimos el signal a observable en el contexto de inyección válido
  private readonly projectId$ = toObservable(this.globalContext.currentProjectId);

  ngOnInit(): void {
    // 🚀 Carga inicial automática y reactiva ante cambios del proyecto global
    this.projectId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((projectId) => {              
        if (!projectId) {
          this.manzanaList = [];
          this.previousProjectId = null;
          return;
        }

        // Limpiamos el control solo si el proyecto realmente cambió y había un proyecto previo
        if (this.previousProjectId && this.previousProjectId !== projectId) {
          this.inputControl.setValue(null);
          this.Change.emit(null);
        }
        
        this.previousProjectId = projectId;
        this.searchManzanas('');
      });

    // Escucha reactiva con debounce de la escritura del usuario
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((term: string) => {
      this.searchManzanas(term);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * ⚡ Corrección del Error TS2345: Captura de forma segura el texto o el evento del select-data
   */
  public onSearchInput(event: Event | string): void {
    const term = typeof event === 'string' ? event : (event.target as HTMLInputElement)?.value || '';
    this.searchSubject$.next(term);
  }

  /**
   * Petición HTTP directa limpia basada en el header inyectado
   */
  private searchManzanas(term: string): void {
    this.isLoading = true;

    this.manzanaService.searchManzanas(term)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IManzanaSearchResult[]) => {
          this.manzanaList = data || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.manzanaList = [];
        }
      });
  }

  public onSelect(event: string | IManzanaSearchResult | null): void {
    const selectedValue = typeof event === 'object' && event !== null ? (event as any)[this.bindValue] : (event as string | null);
    this.Change.emit(selectedValue);
  }
}