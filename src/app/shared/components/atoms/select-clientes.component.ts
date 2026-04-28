import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IClienteSearchResult } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { SelectDataComponent } from "./select-data.component";
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-clientes',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule, CommonModule],
  template: `
    <app-select-data
      [itemList]="clientList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'id'"
      [bindLabel]="'nombreCompleto'"
      [searchable]="true"
      [loading]="isLoading"
      [customOptionTemplate]="clienteTemplate"
      (Search)="onSearchInput($event)"
      (ChangeValue)="onSelect($event)">
    </app-select-data>

    <ng-template #clienteTemplate let-item let-searchTerm="searchTerm">
      <div class="py-1">
        <div class="fw-bold text-dark" 
             [innerHTML]="highlightText(item.nombreCompleto, searchTerm)">
        </div>

        <div class="d-flex align-items-center gap-1 mt-1 text-muted" style="font-size: 0.75rem;">
          <i class="ph ph-identification-card"></i>
          <span>Documento: </span>
          <b [innerHTML]="highlightText(item.nroDocumento, searchTerm)"></b>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host ::ng-deep .highlight-match {
      background-color: #fff3cd;
      font-weight: bold;
      padding: 0 2px;
      border-radius: 2px;
    }
  `]
})
export class SelectClientesComponent implements OnInit, OnDestroy {
  @Input() inputControl = new FormControl();
  @Input() placeholder = 'Buscar Cliente...';
  @Output() Change = new EventEmitter<string | null>();

  public clientList: IClienteSearchResult[] = [];
  public isLoading = false;

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchClients(term);
    });

    this.searchClients(''); // Carga inicial
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(term: string): void {
    this.searchSubject$.next(term);
  }

  private searchClients(term: string): void {
    this.isLoading = true;
    this.clienteService.searchClients(term).subscribe({
      next: (data) => {
        this.clientList = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error buscando clientes', err);
        this.isLoading = false;
      }
    });
  }

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }

  /**
   * Resalta el texto que coincide con la búsqueda
   */
  highlightText(fullText: string, searchTerm: string): string {
    if (!searchTerm || !fullText) return fullText;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return fullText.replace(regex, `<span class="highlight-match">$1</span>`);
  }
}