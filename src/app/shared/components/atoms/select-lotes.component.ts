import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { ILoteByLoteDisponible } from 'src/app/core/models/lote/lote.model';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { SelectDataComponent } from './select-data.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-lotes',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule, CommonModule],
  template: `
    <app-select-data
      [label]="label"
      [itemList]="loteList"
      [inputControl]="inputControl"
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

  // Inputs
  @Input() label = 'Seleccionar Lote';
  @Input() inputControl = new FormControl<string | null>(null);
  @Input() manzanaId: string | null = null;
  @Input() placeholder = 'Buscar lote...';

  // Output
  @Output() Change = new EventEmitter<string | null>();

  // Estado
  public loteList: ILoteByLoteDisponible[] = [];
  public isLoading = false;

  // RxJS
  private destroy$ = new Subject<void>();


  ngOnInit(): void {
    // Cargamos lotes siempre al inicio (si hay manzanaId filtra, si no trae todos)
    this.loadLotes(this.manzanaId || undefined);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia la manzana, limpiamos y recargamos automáticamente
    if (changes['manzanaId'] && !changes['manzanaId'].firstChange) {
      const currentId = changes['manzanaId'].currentValue;
      this.inputControl.setValue(null);
      this.loteList = [];

      if (currentId) {
        this.loadLotes(currentId);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadLotes(manzanaId?: string): void {
    this.isLoading = true;

    this.loteService.getLotesDisponibles(manzanaId).subscribe({
      next: (data) => {
        console.log('Data', data);

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
  highlightText(text: string, term: string): string {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, `<span class="highlight-match">$1</span>`);
  }
}
