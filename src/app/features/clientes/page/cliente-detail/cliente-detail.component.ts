import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ICliente } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { ViewClientDetailComponent } from '../../views/view-client-detail/view-client-detail.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-cliente-detail',
  standalone: true,
  imports: [PageContainerComponent, CommonModule, ViewClientDetailComponent, NzSpinModule],
  template: `
    <app-page-container
      [title]="'Detalle del Cliente: ' + (cliente?.nombreCompleto || 'Cargando...')"
      permissionScope="clientes"
      [showBack]="true"
      [showEdit]="true"
      (Back)="onBack()"
      (Edit)="onEdit()"
    >
    @if (loading) {
        <div class="text-center py-5">
          <nz-spin nzSimple nzSize="large"></nz-spin>
        </div>
      } @else if (cliente) {
        <!-- Inyectamos la vista Dumb -->
        <app-view-client-detail [cliente]="cliente"></app-view-client-detail>
      } @else {
        <div class="alert alert-warning">
          No se encontró información del cliente.
        </div>
      }
  </app-page-container>
  `,
  styles: ``
})
export class ClienteDetailComponent implements OnInit {

  cliente: ICliente | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clienteService: ClienteService,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    } else {
      this.notification.error('ID de cliente no proporcionado');
      this.onBack();
    }
  }
  loadClient(id: string): void {
    this.loading = true;
    this.clienteService.getClientById(id).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => this.cliente = data,
      error: () => {
        this.notification.error('Error al cargar los datos del cliente');
        this.onBack();
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/clientes'], { relativeTo: this.route });
  }

  onEdit(): void {
    if (this.cliente) {
      this.router.navigate(['/clientes/editar', this.cliente.id], { relativeTo: this.route });
    }
  }
}
