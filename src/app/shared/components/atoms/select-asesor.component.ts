import { Component, inject, Input, OnInit } from '@angular/core';
import { SelectDataComponent } from './select-data.component';
import { CommonModule } from '@angular/common';
import { IAsesorOption } from 'src/app/core/models/asesor/asesor.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsesorService } from 'src/app/core/services/asesor.service';
import { catchError, debounce, Observable, of, startWith, Subject, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-select-asesor',
  standalone: true,
  imports: [SelectDataComponent, CommonModule, ReactiveFormsModule],
  template: `
    <app-select-data
      [label]="label"
      [itemList]="(asesores$ | async) || []"
      bindLabel="nombreCompleto"
      bindValue="id"
      [searchable]="true"
      [loading]="isLoading"
      [inputControl]="control"
      [customOptionTemplate]="asesorTemplate"
      (Search)="onSearch($event)">
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

  @Input() label = 'Asesor';
  @Input() control = new FormControl<string | null>(null);

  asesores$!: Observable<IAsesorOption[]>;
  private searchSubject = new Subject<string>();
  isLoading = false;

  ngOnInit(): void {
    this.asesores$ = this.searchSubject.pipe(
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
  }

  onSearch(term: string): void {
    console.log('📝 Término de búsqueda:', `"${term}"`);
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

}