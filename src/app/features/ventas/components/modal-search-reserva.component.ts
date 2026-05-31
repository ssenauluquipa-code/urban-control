import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { ReservaService } from 'src/app/core/services/reserva.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { IReserva, EstadoReserva } from 'src/app/core/models/reserva.model';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


/** Modal con tabla de reservas activas filtrables por texto. */
@Component({
  selector: 'app-modal-search-reserva',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzIconModule,
    NzTagModule,
    FormsModule,
    ModalContainerComponent
  ],
  template: `
  <app-modal-container [mainTitleModal]="'Buscar Reserva Activa'" [showFooter]="false">
    <div class="p-3">
      <div class="mb-3">
        <nz-input-group [nzSuffix]="suffixIconSearch">
          <input type="text" nz-input placeholder="Buscar por cliente, lote o código..." [(ngModel)]="searchText" (ngModelChange)="filterData()" />
        </nz-input-group>
        <ng-template #suffixIconSearch>
          <span nz-icon nzType="search"></span>
        </ng-template>
      </div>

      <nz-table
        #reservaTable
        [nzData]="filteredReservas"
        [nzLoading]="loading"
        [nzPageSize]="5"
        nzSize="middle"
      >
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Lote / Manzana</th>
            <th>Monto</th>
            <th>Vencimiento</th>
            <th nzWidth="100px">Acción</th>
          </tr>
        </thead>
        <tbody>
          @for (data of reservaTable.data; track data.reservaId) {
            <tr>
              <td>
                <b class="text-primary">#{{ data.codigoReserva }}</b>
              </td>
              <td>
                <div class="d-flex flex-column">
                  <span class="fw-bold">{{ data.nombreCliente }}</span>
                  <small class="text-muted">{{ data.nroDocumento }}</small>
                </div>
              </td>
              <td>
                <nz-tag nzColor="blue">Lote {{ data.numeroLote }}</nz-tag>
                <nz-tag nzColor="orange">Mz. {{ data.manzana }}</nz-tag>
              </td>
              <td>
                <b class="text-success">{{
                  data.montoReserva | currency: (data.moneda || "BS")
                }}</b>
              </td>
              <td>
                <span [class.text-danger]="isExpired(data.fechaVencimiento)">
                  {{ data.fechaVencimiento | date: "dd/MM/yyyy" }}
                </span>
              </td>
              <td>
                <button
                  nz-button
                  nzType="primary"
                  nzSize="small"
                  (click)="selectReserva(data)"
                >
                  <span nz-icon nzType="check"></span> Seleccionar
                </button>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
    </app-modal-container>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ModalSearchReservaComponent implements OnInit {
  private reservaService = inject(ReservaService);
  private projectStatusService = inject(ProjectStatusGlobalService);
  private activeModal = inject(NgbActiveModal);
  private notification = inject(NotificationService);

  loading = false;
  reservas: IReserva[] = [];
  filteredReservas: IReserva[] = [];
  searchText = '';

  ngOnInit(): void {
    this.loadReservas();
  }

  /** Carga reservas ACTIVAS del proyecto actual. */
  loadReservas(): void {
    const proyectoId = this.projectStatusService.getCurrentProjectId();
    if (!proyectoId) {
      this.reservas = [];
      this.filteredReservas = [];
      this.notification.warning('Seleccione un proyecto para listar reservas activas.');
      return;
    }

    this.loading = true;
    // Igual que en list-reservas: el proyecto viaja por header X-Project-Id (interceptor).
    this.reservaService
      .getReservas(EstadoReserva.ACTIVA)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (data) => {
          this.reservas = data;
          this.filteredReservas = [...data];
        },
        error: () => {
          this.notification.error('No se pudieron cargar las reservas activas.');
        }
      });
  }

  /** Filtra la tabla por cliente, código, lote o manzana. */
  filterData(): void {
    if (!this.searchText) {
      this.filteredReservas = [...this.reservas];
      return;
    }

    const term = this.searchText.toLowerCase();
    this.filteredReservas = this.reservas.filter(r =>
      r.nombreCliente?.toLowerCase().includes(term) ||
      r.codigoReserva?.toString().includes(term) ||
      r.numeroLote?.toString().includes(term) ||
      r.manzana?.toLowerCase().includes(term)
    );
  }

  isExpired(date: string): boolean {
    return new Date(date) < new Date();
  }

  /** Cierra el modal devolviendo la reserva elegida. */
  selectReserva(reserva: IReserva): void {
    this.activeModal.close(reserva);
  }
}
