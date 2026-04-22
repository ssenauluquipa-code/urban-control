import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ILoteSearchResult } from 'src/app/core/models/lote/lote.model';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { SelectDataComponent } from './select-data.component';

@Component({
  selector: 'app-select-lotes',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
     <app-select-data
      [itemList]="loteList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'id'"
      [bindLabel]="'numero'"    
      [searchable]="true"
      [loading]="isLoading"
      (Search)="onSearchInput($event)"
      (ChangeValue)="onSelect($event)">
    </app-select-data>

  `,
  styles: ``
})
export class SelectLotesComponent implements OnInit, OnChanges, OnDestroy {

  // Inputs
  @Input() inputControl = new FormControl();
  @Input() manzanaId: string | null = null; // Dependencia de cascada
  @Input() placeholder = 'Seleccionar Lote';

  // Output
  @Output() Change = new EventEmitter<string | null>();

  // Estado
  public loteList: ILoteSearchResult[] = [];
  public isLoading = false;

  // RxJS
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  private loteService = inject(LoteService);

  ngOnInit(): void {
    // 1. Configuramos el Debounce (espera 300ms para buscar)
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      if (this.manzanaId) {
        this.searchLotes(this.manzanaId, term);
      }
    });

    // 2. Carga inicial si ya tenemos manzanaId
    if (this.manzanaId) {
      this.searchLotes(this.manzanaId, '');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 👇 Si cambia la manzanaId, reseteamos y recargamos
    if (changes['manzanaId']) {
      this.inputControl.setValue(null); // Limpia selección anterior
      this.loteList = []; // Limpia lista

      if (this.manzanaId) {
        this.searchLotes(this.manzanaId, '');
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- Métodos ---

  /**
   * Recibe el término del evento (Search) y lo pasa al Subject
   */
  onSearchInput(term: string): void {
    this.searchSubject$.next(term);
  }

  private searchLotes(manzanaId: string, term: string): void {
    this.isLoading = true;
    this.loteService.searchLotes(manzanaId, term).subscribe({
      next: (data) => {
        this.loteList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error buscando lotes', err);
        this.isLoading = false;
      }
    });
  }

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }
}
