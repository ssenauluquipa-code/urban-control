import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { SelectDataComponent } from './select-data.component';
import { CommonModule } from '@angular/common';
import { IAsesorOption } from 'src/app/core/models/asesor/asesor.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsesorService } from 'src/app/core/services/asesor.service';
import { catchError, debounce, map, Observable, of, startWith, Subject, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-select-asesor',
  standalone: true,
  imports: [SelectDataComponent, CommonModule, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="(asesores$ | async) || []"
      bindLabel="nombreCompleto"
      bindValue="id"
      [searchable]="true"
      [loading]="isLoading"
      [inputControl]="input_control"
      [customOptionTemplate]="asesorTemplate"
      (Search)="onSearch($event)"
      (SelectionChange)="onSelectionChange($event)"
      >
    </app-select-data>

    <ng-template #asesorTemplate let-item let-searchTerm="searchTerm">
      <div class="py-1">
        <div class="fw-bold" [innerHTML]="highlightText(item.nombreCompleto, searchTerm)"></div>
        <small class="text-muted d-block" style="font-size: 0.75rem; margin-top: -2px;">
          Documento: <strong>{{ item.nroDocumento }}</strong>
        </small>
      </div>
    </ng-template>
  `,
  styles: ``
})
export class SelectAsesorComponent implements OnInit {

  private asesorService = inject(AsesorService);

  @Input() input_control = new FormControl<string | null>(null);
  @Output() SelectionChange = new EventEmitter<IAsesorOption | null>();

  asesores$!: Observable<IAsesorOption[]>;
  private searchSubject = new Subject<string>();
  isLoading = false;

  ngOnInit(): void {
    // 1. Crear el flujo principal de búsqueda
    const searchFlow$ = this.searchSubject.pipe(
      startWith(''),
      debounce((term) => (!term || term.trim() === '' ? of(null) : timer(400))),
      tap(() => (this.isLoading = true)),
      switchMap((term) =>
        this.asesorService.searchAsesores(term || '').pipe(
          catchError(() => of([])),
          tap(() => (this.isLoading = false))
        )
      )
    );

    // 2. Si el control ya tiene un valor inicial (ej. en modo edición),
    // nos aseguramos de traer ese asesor en particular para que aparezca en el listado.
    this.asesores$ = this.input_control.valueChanges.pipe(
      startWith(this.input_control.value),
      switchMap((initialId) => {
        if (initialId) {
          // Buscamos los datos completos del asesor seleccionado
          return this.asesorService.getAsesorById(initialId).pipe(
            switchMap((asesor) => {
              const mappedAsesor: IAsesorOption = {
                id: asesor.id,
                nombreCompleto: asesor.nombreCompleto,
                nroDocumento: asesor.nroDocumento || '',
                telefono: asesor.telefono || '',
                email: asesor.email || ''
              };
              return searchFlow$.pipe(
                map((list) => {
                  // Si no está ya en la lista, lo agregamos al principio
                  if (!list.some((item) => item.id === mappedAsesor.id)) {
                    return [mappedAsesor, ...list];
                  }
                  return list;
                })
              );
            }),
            catchError(() => searchFlow$)
          );
        }
        return searchFlow$;
      })
    );
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  /**
   * Resalta el texto buscado aplicando un subrayado.
   * El cascarón select-data ya tiene el estilo para .highlight-match
   */
  highlightText(fullText: string, searchTerm: string): string {
    if (!searchTerm || !fullText) return fullText;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return fullText.replace(regex, `<span class="highlight-match">$1</span>`);
  }

  onSelectionChange(asesor: IAsesorOption | null) {
    this.SelectionChange.emit(asesor);
  }

}