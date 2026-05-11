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
      [inputControl]="internal_control"
      [placeholder]="input_placeholder"
      [bindValue]="'id'"
      [bindLabel]="'nombreCompleto'"
      [searchable]="true"
      [loading]="isLoading"
      [customOptionTemplate]="clienteTemplate"
      [customLabelTemplate]="clienteLabelTemplate"
      [isMultiple]="multiple"
      [addTag]="true"
      (AddTag)="abrirModalCrearCliente($event)"
      (Search)="onSearchInput($event)"
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

    <ng-template #clienteLabelTemplate let-item let-clear="clear">
      <div class="cliente-tag d-flex align-items-center gap-1 px-2 py-1 rounded-2"
           [class.is-titular]="isTitular(item.id)"
           [class.is-cotitular]="!isTitular(item.id)">
        <i class="ph ph-user-circle" [class.text-white]="true"></i>
        <span class="tag-label text-truncate" style="max-width: 120px;">
          {{ item.nombreCompleto }}
        </span>
        <span class="role-badge ms-1">
          {{ isTitular(item.id) ? 'T' : 'C' }}
        </span>
        <span class="tag-remove ms-1 d-flex align-items-center justify-content-center" 
              role="button"
              tabindex="0"
              style="cursor: pointer; width: 16px; height: 16px; border-radius: 50%; background: rgba(255,255,255,0.2);"
              (click)="clear(item); $event.stopPropagation()" 
              (keydown.enter)="clear(item); $event.stopPropagation()"
              (keydown.space)="clear(item); $event.preventDefault(); $event.stopPropagation()"
              (mousedown)="$event.stopPropagation()"
              title="Quitar">
          <i class="bi bi-x-lg text-white" style="font-size: 8px;"></i>
        </span>
      </div>
    </ng-template>
  `,
  styles: [`
    /* Resaltado de búsqueda — específico de este componente */
    :host ::ng-deep .highlight-match {
      background-color: #fff3cd;
      font-weight: bold;
      border-radius: 2px;
    }

    /* Tags de clientes seleccionados */
    .cliente-tag {
      color: white;
      font-size: 12px;
      font-weight: 500;
      margin-right: 4px;
      margin-bottom: 2px;
      border: 1px solid transparent;

      &.is-titular {
        background-color: #198754;
        border-color: #157347;
      }

      &.is-cotitular {
        background-color: #0d6efd;
        border-color: #0b5ed7;
      }

      .tag-label {
        color: white;
      }

      .role-badge {
        background: rgba(255,255,255,0.2);
        padding: 0 5px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
      }

      .tag-remove {
        cursor: pointer;
        opacity: 0.7;
        &:hover {
          opacity: 1;
        }
      }
    }

    /* Eliminar el fondo/borde del ng-value wrapper en modo múltiple */
    :host ::ng-deep .ng-select.ng-select-multiple .ng-select-container .ng-value {
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      margin: 2px 0 !important;
    }

    :host ::ng-deep .ng-select.ng-select-multiple .ng-select-container .ng-value .ng-value-label {
      padding: 0 !important;
    }

    /* En modo múltiple necesitamos flex-wrap para los tags */
    :host ::ng-deep .ng-select.ng-select-multiple .ng-value-container {
      flex-wrap: wrap !important;
      gap: 4px !important;
    }
  `]
})
export class SelectClientesComponent<T = string | string[] | CreateVentaPropietarioDto[]> implements OnInit, OnDestroy {
  // InputControl del padre (puede contener IDs o DTOs complejos)
  @Input() input_control = new FormControl<T | null>(null);
  @Input() input_placeholder = 'Buscar Cliente...';
  @Input() multiple = false;
  @Input() maxSelection = 3; 
  @Input() withRoles = false;

  @Output() Change = new EventEmitter<SelectClienteOutput>();

  // Control interno para el ng-select (solo maneja IDs para no confundir al buscador)
  public internal_control = new FormControl<string | string[] | null>(null);

  public clientList: IClienteSearchResult[] = [];
  public selectedClientes: IClienteSearchResult[] = [];
  public isLoading = false;

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(NgbModal);

  ngOnInit(): void {
    // 1. Sincronización Inicial: Si el padre ya tiene datos, extraemos los IDs
    const initialValue = this.input_control.value;
    if (initialValue) {
      this.internal_control.setValue(this.extractIds(initialValue), { emitEvent: false });
    }

    // 2. Búsqueda reactiva
    this.searchSubject$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term: string) => this.searchClients(term));

    this.searchClients('');

    // 3. Sincronización continua: Cuando el selector interno cambia, actualizamos el padre con la estructura correcta
    this.internal_control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.processSelectionChange(value);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Extrae IDs de cualquier estructura (string, string[] o DTO[])
   */
  private extractIds(value: any): string | string[] | null {
    if (!value) return null;
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? v : v.clienteId);
    }
    return typeof value === 'string' ? value : value.clienteId;
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
   * Procesa el cambio de IDs internos y actualiza el control externo con la estructura final
   */
  private processSelectionChange(value: string | string[] | null): void {
    if (!this.multiple) {
      this.input_control.setValue(value as unknown as T);
      this.Change.emit(value as SelectClienteOutput);
      return;
    }

    const selectedIds: string[] = (value as string[]) || [];

    // Actualizar lista de objetos para previsualización
    this.selectedClientes = this.clientList.filter(c => selectedIds.includes(c.id));

    // Aplicar tope de selección
    if (this.selectedClientes.length > this.maxSelection) {
      this.selectedClientes = this.selectedClientes.slice(0, this.maxSelection);
      const limitedIds = this.selectedClientes.map(c => c.id);
      this.internal_control.setValue(limitedIds, { emitEvent: false });
    }

    // Generar valor final según modo
    let finalValue: any;
    if (this.withRoles) {
      finalValue = this.selectedClientes.map((c, index) => ({
        clienteId: c.id,
        rol: index === 0 ? RolPropietario.TITULAR : RolPropietario.COTITULAR
      }));
    } else {
      finalValue = this.selectedClientes.map(c => c.id);
    }

    // Actualizar control externo y emitir
    this.input_control.setValue(finalValue as unknown as T);
    this.Change.emit(finalValue);
  }

  highlightText(fullText: string, searchTerm: string): string {
    if (!searchTerm || !fullText) return fullText;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return fullText.replace(regex, `<span class="highlight-match">$1</span>`);
  }

  abrirModalCrearCliente(nombreCompleto: string): void {
    const modalRef = this.modalService.open(ModelMultiClientesComponent, {
      size: 'lg', centered: true, backdrop: 'static'
    });

    modalRef.componentInstance.nombrePrellenado = nombreCompleto;

    modalRef.result.then((nuevoCliente: IClienteSearchResult) => {
      if (nuevoCliente && nuevoCliente.id) {
        this.clientList = [nuevoCliente, ...this.clientList];
        
        if (this.multiple) {
          const current = (this.internal_control.value as string[]) || [];
          this.internal_control.setValue([...current, nuevoCliente.id]);
        } else {
          this.internal_control.setValue(nuevoCliente.id);
        }
        this.cdr.detectChanges();
      }
    }).catch(() => {});
  }

  isTitular(clientId: string): boolean {
    if (!this.withRoles) return false;
    const val = this.internal_control.value;
    if (Array.isArray(val) && val.length > 0) {
      return val[0] === clientId;
    }
    return false;
  }
}
