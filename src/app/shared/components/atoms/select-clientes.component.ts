import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IClienteSearchResult } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { SelectDataComponent } from './select-data.component';
import { CreateVentaPropietarioDto, RolPropietario, SelectClienteOutput } from 'src/app/core/models/venta.model';
import { ModelMultiClientesComponent } from 'src/app/features/clientes/components/model-multi-clientes/model-multi-clientes.component';

@Component({
  selector: 'app-select-clientes',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      [customLabelTemplate]="multiple ? clienteLabelTemplate : undefined"
      [isMultiple]="multiple"
      [addTag]="true"
      [minLength]="1"
      [maxLength]="maxSelection"
      (AddTag)="abrirModalCrearCliente($event)"
      (Search)="onSearchInput($event)"
    >
    </app-select-data>

    <ng-template #clienteTemplate let-item>
      <div class="py-1">
        <div class="fw-bold text-dark">{{ item.nombreCompleto }}</div>
        <div class="d-flex align-items-center gap-1 mt-1 text-muted" style="font-size: 0.75rem;">
          <i class="ph ph-identification-card"></i>
          <span>Doc: </span>
          <b>{{ item.nroDocumento }}</b>
        </div>
      </div>
    </ng-template>

    <ng-template #clienteLabelTemplate let-item let-clear="clear">
      <div class="cliente-tag d-flex align-items-center gap-1 px-2 py-1 rounded-2"
           [class.is-titular]="isTitular(item.id)"
           [class.is-cotitular]="!isTitular(item.id)">
        <i class="ph ph-user-circle text-white"></i>
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
              (keydown.enter)="clear(item); $event.stopPropagation()">
          <i class="bi bi-x-lg text-white" style="font-size: 8px;"></i>
        </span>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }

    :host ::ng-deep .highlight-match {
      background-color: #fff3cd;
      font-weight: bold;
      border-radius: 2px;
    }

    .cliente-tag {
      color: white;
      font-size: 12px;
      font-weight: 500;
      margin-right: 4px;
      margin-bottom: 2px;
      border: 1px solid transparent;

      &.is-titular { background-color: #198754; border-color: #157347; }
      &.is-cotitular { background-color: #0d6efd; border-color: #0b5ed7; }

      .tag-label { color: white; }
      .role-badge {
        background: rgba(255,255,255,0.2);
        padding: 0 5px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
      }
    }

    :host ::ng-deep .ng-select.ng-select-multiple .ng-select-container .ng-value {
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      margin: 2px 0 !important;
    }
    :host ::ng-deep .ng-select.ng-select-multiple .ng-select-container .ng-value-container {
      flex-wrap: wrap !important;
      gap: 4px !important;
    }
  `]
})
export class SelectClientesComponent<T = string | string[] | CreateVentaPropietarioDto[]> implements OnInit, OnDestroy {
  private clienteService = inject(ClienteService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(NgbModal);

  @Input() input_control = new FormControl<T | null>(null);
  @Input() input_placeholder = 'Buscar Cliente...';
  @Input() multiple = false;
  @Input() maxSelection = 3;
  @Input() withRoles = false;

  @Input() set preloadedClient(cliente: { id: string; nombreCompleto: string } | null | undefined) {
    if (cliente && cliente.id) {
      const mockClient: IClienteSearchResult = {
        id: cliente.id,
        nombreCompleto: cliente.nombreCompleto,
        nroDocumento: 'N/A'
      };
      this.poolClientesSeleccionados.set(cliente.id, mockClient);
      if (!this.clientList.find(c => c.id === cliente.id)) {
        this.clientList = [mockClient, ...this.clientList];
        this.cdr.markForCheck();
      }

      const currentVal = this.input_control.value;
      const ids = this.extractIds(currentVal);
      if (this.withRoles && ids.length > 0 && ids[0] === cliente.id) {
        this.TitularNombre.emit(cliente.nombreCompleto);
      }
    }
  }

  @Output() Change = new EventEmitter<SelectClienteOutput>();
  /** Emite el nombre completo del titular (índice 0) cuando withRoles=true */
  @Output() TitularNombre = new EventEmitter<string>();

  public clientList: IClienteSearchResult[] = [];
  public internal_control = new FormControl<string | string[] | null>(null);
  public isLoading = false;

  // Almacén en memoria persistente para salvaguardar los objetos completos de los clientes seleccionados
  private poolClientesSeleccionados: Map<string, IClienteSearchResult> = new Map();

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.inicializarValorExterno();

    // Búsqueda con debounce para protección de la API
    this.searchSubject$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term: string) => this.searchClients(term));

    this.searchClients('');

    // Escuchar mutaciones internas del componente visual
    this.internal_control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.processSelectionChange(value);
      });

    // Sincronizar reactivamente cambios externos del padre (Reemplazo total y eficiente de DoCheck)
    this.input_control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(externalValue => {
        const nextIds = this.extractIds(externalValue);
        const desiredInternalValue = this.multiple ? nextIds : (nextIds.length > 0 ? nextIds[0] : null);

        if (JSON.stringify(this.internal_control.value) !== JSON.stringify(desiredInternalValue)) {
          this.internal_control.setValue(desiredInternalValue, { emitEvent: false });
          this.cdr.markForCheck();
        }

        if (this.withRoles && nextIds.length > 0) {
          const titularId = nextIds[0];
          const client = this.poolClientesSeleccionados.get(titularId);
          if (client) {
            this.TitularNombre.emit(client.nombreCompleto);
          }
        }
      });

    // Escuchar el estado de validación/touched del control padre
    this.input_control.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.syncValidationStatus();
      });
  }

  private inicializarValorExterno(): void {
    const initialValue = this.input_control.value;
    if (initialValue) {
      const ids = this.extractIds(initialValue);
      const desiredInternalValue = this.multiple ? ids : (ids.length > 0 ? ids[0] : null);
      this.internal_control.setValue(desiredInternalValue, { emitEvent: false });

      if (this.withRoles && ids.length > 0) {
        const titularId = ids[0];
        const client = this.poolClientesSeleccionados.get(titularId);
        if (client) {
          this.TitularNombre.emit(client.nombreCompleto);
        }
      }
    }
    this.syncValidationStatus();
  }

  private syncValidationStatus(): void {
    if (this.input_control.invalid) {
      this.internal_control.setErrors(this.input_control.errors, { emitEvent: false });
    } else {
      this.internal_control.setErrors(null, { emitEvent: false });
    }

    if (this.input_control.touched) {
      this.internal_control.markAsTouched({ onlySelf: true });
    } else {
      this.internal_control.markAsUntouched({ onlySelf: true });
    }
    this.cdr.markForCheck();
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
    this.cdr.markForCheck();

    this.clienteService.searchClients(term).subscribe({
      next: (data: IClienteSearchResult[]) => {
        const yaSeleccionados = Array.from(this.poolClientesSeleccionados.values());
        const nuevosFiltrados = data.filter(d => !this.poolClientesSeleccionados.has(d.id));

        // Unimos el pool persistente con los nuevos resultados para que ng-select no rompa los tags
        this.clientList = [...yaSeleccionados, ...nuevosFiltrados];

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private processSelectionChange(value: string | string[] | null): void {
    if (!this.multiple) {
      this.input_control.setValue(value as unknown as T, { emitEvent: true });
      this.Change.emit(value as SelectClienteOutput);
      return;
    }

    let selectedIds: string[] = (value as string[]) || [];

    // Guardar en el pool los objetos de los clientes seleccionados presentes en la lista actual
    this.clientList.forEach(c => {
      if (selectedIds.includes(c.id) && !this.poolClientesSeleccionados.has(c.id)) {
        this.poolClientesSeleccionados.set(c.id, c);
      }
    });

    // Limpiar del pool permanente lo que el usuario removió de los tags
    Array.from(this.poolClientesSeleccionados.keys()).forEach(id => {
      if (!selectedIds.includes(id)) {
        this.poolClientesSeleccionados.delete(id);
      }
    });

    // Imponer tope estricto de selección
    if (selectedIds.length > this.maxSelection) {
      selectedIds = selectedIds.slice(0, this.maxSelection);
      this.internal_control.setValue(selectedIds, { emitEvent: false });
    }

    // Reconstruir la lista ordenada leyendo desde el pool seguro en memoria
    const objetosSeleccionados = selectedIds
      .map(id => this.poolClientesSeleccionados.get(id))
      .filter((c): c is IClienteSearchResult => !!c);

    let finalValue: unknown;

    if (this.withRoles) {
      // Determinación estricta de Roles: El primer elemento seleccionado en el índice 0 toma el rol de TITULAR
      finalValue = objetosSeleccionados.map((c, index) => ({
        clienteId: c.id,
        rol: index === 0 ? RolPropietario.TITULAR : RolPropietario.COTITULAR
      }));
      // Emitimos el nombre del titular para que el padre pueda usarlo
      if (objetosSeleccionados.length > 0) {
        this.TitularNombre.emit(objetosSeleccionados[0].nombreCompleto);
      }
    } else {
      // Modo simple: Enviamos el array puro de IDs
      finalValue = selectedIds;
    }

    this.input_control.setValue(finalValue as T, { emitEvent: true });
    this.Change.emit(finalValue as SelectClienteOutput);
  }

  abrirModalCrearCliente(nombreCompleto: string): void {
    const modalRef = this.modalService.open(ModelMultiClientesComponent, {
      size: 'lg', centered: true, backdrop: 'static'
    });
    modalRef.componentInstance.nombrePrellenado = nombreCompleto;

    modalRef.result.then((result: IClienteSearchResult) => {
      this.applyClienteCreado(result);
    }).catch(() => { });
  }

  private applyClienteCreado(cliente: IClienteSearchResult): void {
    if (!cliente?.id) return;

    this.poolClientesSeleccionados.set(cliente.id, cliente);
    this.clientList = [cliente, ...this.clientList.filter((c) => c.id !== cliente.id)];

    if (this.multiple) {
      const current = (this.internal_control.value as string[]) ?? [];
      const nextIds = current.includes(cliente.id) ? current : [...current, cliente.id];
      this.internal_control.setValue(nextIds);
    } else {
      this.internal_control.setValue(cliente.id);
    }
    this.cdr.markForCheck();
  }

  private extractIds(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? v : (v as CreateVentaPropietarioDto).clienteId);
    }
    return typeof value === 'string' ? [value] : [(value as CreateVentaPropietarioDto).clienteId];
  }

  isTitular(clientId: string): boolean {
    if (!this.withRoles) return false;
    const val = this.internal_control.value;
    if (Array.isArray(val)) {
      return val.length > 0 && val[0] === clientId;
    }
    return val === clientId;
  }
}
