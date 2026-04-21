import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { IManzanaSearchResult } from 'src/app/core/models/manzana/manzana.model';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { SelectDataComponent } from "./select-data.component";

@Component({
  selector: 'app-select-manzanas',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="manzanaList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'id'"
      [bindLabel]="'codigo'"
      [loading]="isLoading"
      (ChangeValue)="onSelect($event)">
    </app-select-data>
  `,
  styles: ``
})
export class SelectManzanasComponent implements OnInit, OnChanges, OnDestroy {

  // Inputs
  @Input() inputControl = new FormControl();
  @Input() proyectoId: string | null = null; // 👈 Recibe el proyecto para filtrar
  @Input() placeholder = 'Seleccionar Manzana';
  @Output() Change = new EventEmitter<string | null>();

  // Estado
  public manzanaList: IManzanaSearchResult[] = [];
  public isLoading = false;

  // RxJS
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  private manzanaService = inject(ManzanaService);

  ngOnInit(): void {
    // Configuramos el Debounce
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      if (this.proyectoId) {
        this.searchManzanas(this.proyectoId, term);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el proyecto, reseteamos y cargamos las manzanas del nuevo proyecto
    if (changes['proyectoId']) {
      this.inputControl.setValue(null);
      this.manzanaList = [];

      if (this.proyectoId) {
        // Iniciamos búsqueda con término vacío para traer las primeras opciones
        this.searchManzanas(this.proyectoId, '');
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
     * Recibe lo que el usuario escribe y lo emite al Subject (con debounce)
     */
  onSearchInput(term: string): void {
    this.searchSubject$.next(term);
  }

  /**
  * Llama al servicio usando el método searchManzanas
  */
  private searchManzanas(proyectoId: string, term: string): void {
    this.isLoading = true;

    // 👇 Usamos el método que indicaste: searchManzanas(proyectoId, term)
    this.manzanaService.searchManzanas(proyectoId, term).subscribe({
      next: (data: IManzanaSearchResult[]) => {
        this.manzanaList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error buscando manzanas', err);
        this.isLoading = false;
      }
    });
  }

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }

}
