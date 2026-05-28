import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ILoteByLoteDisponible } from 'src/app/core/models/lote/lote.model';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { SelectDataComponent } from './select-data.component';
import { CommonModule } from '@angular/common';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { takeUntil, distinctUntilChanged, skip } from 'rxjs/operators';

@Component({
  selector: 'app-select-lotes',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule, CommonModule],
  template: `
    <app-select-data
      [itemList]="loteList"
      [inputControl]="input_control"
      [placeholder]="placeholder"
      bindValue="id"
      bindLabel="descripcion"
      [searchable]="true"
      [loading]="isLoading"
      [customOptionTemplate]="loteTemplate"
      (ChangeValue)="onSelect($event)"
    >
    </app-select-data>

    <ng-template #loteTemplate let-item let-searchTerm="searchTerm">
      <div class="py-1">
        <div class="fw-bold text-dark" [innerHTML]="highlightText(item.descripcion, searchTerm)"></div>

        <div class="d-flex justify-content-between mt-1" style="font-size: 0.75rem;">
          <span class="text-success fw-bold">
            <i class="ph ph-money"></i> {{ item.precio | currency:'USD':'symbol':'1.0-2' }}
          </span>
          <span class="text-muted">
            <i class="ph ph-frame-corners"></i> {{ item.areaM2 }} m²
          </span>
        </div>
      </div>
    </ng-template>

  `,
  styles: ``
})
export class SelectLotesComponent implements OnInit, OnChanges, OnDestroy {
  private loteService = inject(LoteService);
  private globalContext = inject(ProjectStatusGlobalService);
  private readonly projectId$ = toObservable(this.globalContext.currentProjectId);

  // Inputs
  @Input() input_control = new FormControl<string | null>(null);
  @Input() manzanaId: string | null = null;
  @Input() placeholder = 'Buscar lote...';
  @Input() forcedLote: any = null; // Lote que debe mostrarse sí o sí (ej: desde reserva)

  // Output
  @Output() Change = new EventEmitter<string | null>();
  @Output() ManzanaChange = new EventEmitter<string | null>();

  // Estado
  public loteList: ILoteByLoteDisponible[] = [];
  public isLoading = false;

  // RxJS
  private destroy$ = new Subject<void>();


  ngOnInit(): void {
    // Cargamos lotes siempre al inicio (si hay manzanaId filtra, si no trae todos)
    this.loadLotes(this.manzanaId);

    // Cuando cambia el proyecto global, limpiamos la selección y recargamos
    this.projectId$
      .pipe(
        skip(1), // ignoramos la emisión inicial, ngOnInit ya cargó
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.input_control.setValue(null, { emitEvent: false });
        this.loteList = [];
        this.loadLotes(this.manzanaId);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia la manzana, recargamos automáticamente
    if (changes['manzanaId'] && !changes['manzanaId'].firstChange) {
      const currentId = changes['manzanaId'].currentValue;
      this.loadLotes(currentId);
    }

    // Si cambia el lote forzado (desde reserva), recargamos para incluirlo en la lista
    if (changes['forcedLote'] && !changes['forcedLote'].firstChange) {
      this.loadLotes(this.manzanaId);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLotes(manzanaId: string | null): void {
    this.isLoading = true;

    this.loteService.getLotesDisponibles(manzanaId).subscribe({
      next: (data) => {
        // Asegurar que cada lote tenga descripcion para el bindLabel
        this.loteList = data.map(lote => ({
          ...lote,
          descripcion: lote.descripcion || `Lote ${lote.nroLote} - ${lote.areaM2}m²`
        }));

        // Si tenemos un lote forzado (ej: de una reserva), lo añadimos a la lista si no está
        if (this.forcedLote && !this.loteList.find(l => l.id === this.forcedLote.id)) {
          this.loteList.unshift(this.forcedLote);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error buscando lotes', err);
        this.isLoading = false;
      }
    });
  }

  onSelect(event: string): void {
    this.Change.emit(event);
    // Emitir el manzanaId del lote seleccionado
    if (event) {
      const selectedLote = this.loteList.find(lote => lote.id === event);
      this.ManzanaChange.emit(selectedLote?.manzanaId || null);
    } else {
      this.ManzanaChange.emit(null);
    }
  }
  highlightText(text: string, term: string): string {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, `<span class="highlight-match">$1</span>`);
  }
}
