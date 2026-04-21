import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IClienteSearchResult } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { SelectDataComponent } from "./select-data.component";
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-select-clientes',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    
    <app-select-data
      [itemList]="clientList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'id'"
      [bindLabel]="'nombreCompleto'"
      [searchable]="true"
      [loading]="isLoading"
      (Search)="onSearchInput($event)"
      (ChangeValue)="onSelect($event)">
    </app-select-data>

  `,
  styles: ``
})
export class SelectClientesComponent implements OnInit, OnDestroy {
  // Inputs
  @Input() inputControl = new FormControl();
  @Input() placeholder = 'Buscar Cliente...';

  // Output
  @Output() Change = new EventEmitter<string | null>();

  // Estado
  public clientList: IClienteSearchResult[] = [];
  public isLoading = false;

  // RxJS para manejar el debounce
  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  private clienteService = inject(ClienteService);

  ngOnInit(): void {
    // Configuramos el debounce: espera 300ms después de la última tecla
    this.searchSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchClients(term);
    });

    // Carga inicial (opcional: traer algunos clientes al abrir)
    this.searchClients('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Se dispara cuando el usuario escribe en el input.
   * Emitimos el término al Subject para aplicar debounce.
   */
  onSearchInput(term: string): void {
    this.searchSubject$.next(term);
  }
  private searchClients(term: string): void {
    this.isLoading = true;
    this.clienteService.searchClients(term).subscribe({
      next: (data) => {
        this.clientList = data;
        this.isLoading = false;
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
}
