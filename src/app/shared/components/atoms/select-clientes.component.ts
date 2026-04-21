import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IClienteSearchResult } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { SelectDataComponent } from "./select-data.component";

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
      (Search)="onSearch($event)"
      (ChangeValue)="onSelect($event)">
    </app-select-data>

  `,
  styles: ``
})
export class SelectClientesComponent implements OnInit {
  @Input() inputControl = new FormControl();
  @Input() placeholder = 'Buscar Cliente...';
  @Output() Change = new EventEmitter<string | null>();

  public clientList: IClienteSearchResult[] = []; // Interface simplificada: { id, nombreCompleto }

  private clienteService = inject(ClienteService);

  ngOnInit(): void {
    // Opcional: Cargar algunos clientes iniciales
    this.onSearch('');
  }

  onSearch(term: string): void {
    this.clienteService.searchClients(term).subscribe({
      next: (data) => this.clientList = data,
      error: (err) => console.error('Error buscando clientes', err)
    });
  }

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }
}
