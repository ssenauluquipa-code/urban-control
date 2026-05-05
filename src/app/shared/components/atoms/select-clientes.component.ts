import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { IClienteSearchResult } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { SelectDataComponent } from './select-data.component';
import { CreateVentaPropietarioDto, RolPropietario, SelectClienteOutput } from 'src/app/core/models/venta.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModelMultiClientesComponent } from 'src/app/features/clientes/components/model-multi-clientes/model-multi-clientes.component';

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
      [isMultiple]="multiple"
      [addTag]="true"
      (AddTag)="abrirModalCrearCliente($event)"
      (Search)="onSearchInput($event)"
      (ChangeValue)="onSelect($event)"
    >
    </app-select-data>

    <ng-template #clienteTemplate let-item let-searchTerm="searchTerm">
      <div class="py-1">
        <div class="fw-bold text-dark" [innerHTML]="highlightText(item.nombreCompleto, searchTerm)"></div>
        <div class="d-flex align-items-center gap-1 mt-1 text-muted" style="font-size: 0.75rem;">
          <i class="ph ph-identification-card"></i>
          <span>Doc: </span>
          <b [innerHTML]="highlightText(item.nroDocumento, searchTerm)"></b>
        </div>
      </div>
    </ng-template>

    @if (withRoles && selectedClientes.length) {
      <div class="mt-2">
        @for (c of selectedClientes; track c.id; let i = $index) {
          <div class="d-flex justify-content-between align-items-center border rounded px-2 py-1 mb-1 bg-white shadow-sm">
            <div>
              <div class="fw-bold" style="font-size: 13px;">{{ c.nombreCompleto }}</div>
              <div class="text-primary fw-medium" style="font-size: 11px;">
                {{ i === 0 ? 'TITULAR' : 'COTITULAR' }}
              </div>
            </div>
            <button type="button" class="btn btn-sm text-danger border-0" (click)="removeCliente(i)">
              <i class="ph ph-x-circle fs-5"></i>
            </button>
          </div>
        }
      </div>
    }
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
  // InputControl tipado para aceptar string (simple) o string[] (múltiple)
  @Input() inputControl = new FormControl<string | string[] | null>(null);
  @Input() placeholder = 'Buscar Cliente...';
  @Input() multiple = false;
  @Input() maxSelection = 3; // Límite del DTO de ventas
  @Input() withRoles = false;

  //EventEmitter con tipo definido para evitar 'any'
  @Output() Change = new EventEmitter<SelectClienteOutput>();

  public clientList: IClienteSearchResult[] = [];
  public selectedClientes: IClienteSearchResult[] = [];
  public isLoading = false;

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(NgbModal);
  ngOnInit(): void {
    this.searchSubject$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term: string) => this.searchClients(term));

    this.searchClients('');
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
      next: (data: IClienteSearchResult[]) => {
        this.clientList = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => this.isLoading = false
    });
  }

  /**
   * Maneja la selección de items desde el componente base
   */
  onSelect(value: string | string[] | null): void {
    if (!this.multiple) {
      this.Change.emit(value as string | null);
      return;
    }

    const selectedIds: string[] = (value as string[]) || [];

    // Sincronizar objetos completos para la previsualización de roles
    this.selectedClientes = this.clientList.filter((c: IClienteSearchResult) =>
      selectedIds.includes(c.id)
    );

    // Aplicar restricción de máximo de propietarios
    if (this.selectedClientes.length > this.maxSelection) {
      this.selectedClientes = this.selectedClientes.slice(0, this.maxSelection);
      const finalIds: string[] = this.selectedClientes.map((c: IClienteSearchResult) => c.id);
      this.inputControl.setValue(finalIds, { emitEvent: false });
    }

    this.emitirCambio();
  }

  /**
   * Elimina un cliente seleccionado y actualiza el formulario
   */
  removeCliente(index: number): void {
    this.selectedClientes.splice(index, 1);

    const currentIds: string[] = this.selectedClientes.map((c: IClienteSearchResult) => c.id);
    this.inputControl.setValue(currentIds, { emitEvent: false });

    this.emitirCambio();
    this.cdr.detectChanges();
  }

  /**
   * Centraliza la lógica de emisión según la configuración del componente
   */
  private emitirCambio(): void {
    if (this.withRoles) {
      // ✅ Transformación estricta al formato de Propietarios del DTO de Ventas
      const propietarios: CreateVentaPropietarioDto[] = this.selectedClientes.map((c: IClienteSearchResult, index: number) => ({
        clienteId: c.id,
        rol: index === 0 ? RolPropietario.TITULAR : RolPropietario.COTITULAR
      }));
      this.Change.emit(propietarios);
    } else {
      const ids: string[] = this.selectedClientes.map((c: IClienteSearchResult) => c.id);
      this.Change.emit(ids);
    }
  }

  highlightText(fullText: string, searchTerm: string): string {
    if (!searchTerm || !fullText) return fullText;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return fullText.replace(regex, `<span class="highlight-match">$1</span>`);
  }

  abrirModalCrearCliente(nombreCompleto: string): void {
    const modalRef = this.modalService.open(ModelMultiClientesComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.nombrePrellenado = nombreCompleto;

    modalRef.result.then((nuevoCliente: IClienteSearchResult) => {
      if (nuevoCliente && nuevoCliente.id) {
        // Añadir a la lista local para que aparezca en el select
        this.clientList = [nuevoCliente, ...this.clientList];

        // Seleccionarlo automáticamente
        if (this.multiple) {
          const currentValues = (this.inputControl.value as string[]) || [];
          this.inputControl.setValue([...currentValues, nuevoCliente.id]);
        } else {
          this.inputControl.setValue(nuevoCliente.id);
        }

        // Forzar actualización y emitir cambio
        this.onSelect(this.inputControl.value);
        this.cdr.detectChanges();
      }
    }).catch(() => {
      // Modal cerrado sin guardar (cancelado)
    });
  }
}
