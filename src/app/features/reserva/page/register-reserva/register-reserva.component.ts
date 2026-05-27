import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateReservaDto, Moneda } from 'src/app/core/models/reserva.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReservaService } from 'src/app/core/services/reserva.service';
import { OrganizationFinancialConfigService } from 'src/app/core/services/configuracion/organization-financial-config.service';
import { finalize, take } from 'rxjs';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { RegisterReservaViewComponent } from "../../views/register-reserva-view/register-reserva-view.component";

@Component({
  selector: 'app-register-reserva',
  standalone: true,
  imports: [PageContainerComponent, RegisterReservaViewComponent],
  template: `
    <app-page-container
      title="Registrar Reserva"
      [loading]="loading"
      [showSave]="true"
      [showCancel]="true"
      [showOptions]="false"
      (Save)="onSave()"
      (Cancel)="onCancel()"
    >
      <app-register-reserva-view [reservaForm]="formGroup" [proyectoId]="proyectoId">
      </app-register-reserva-view>
    </app-page-container>

  `,
  styles: ``
})
export class RegisterReservaComponent implements OnInit {

  public formGroup!: FormGroup;
  public proyectoId: string | null = null;
  public loading = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private reservaService = inject(ReservaService);
  private notification = inject(NotificationService);
  private globalContext = inject(ProjectStatusGlobalService);
  private financialConfig = inject(OrganizationFinancialConfigService);

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {

    // 1. Obtener proyecto del contexto global
    this.proyectoId = this.globalContext.getCurrentProjectId();

    if (!this.proyectoId) {
      this.notification.warning('Seleccione un proyecto primero');
      this.router.navigate(['/reservas']);
      return;
    }

    this.loadOrganizationFinancialDefaults();
  }

  private loadOrganizationFinancialDefaults(): void {
    this.financialConfig
      .getFinancialConfig()
      .pipe(take(1))
      .subscribe((config) => {
        this.formGroup.patchValue({
          moneda: this.toMoneda(config.currency),
          tipoCambio: config.exchangeRate,
        });
      });
  }

  private toMoneda(currency: string): Moneda {
    return currency === Moneda.USD ? Moneda.USD : Moneda.BS;
  }

  private buildForm(): void {
    this.formGroup = this.fb.group({
      clienteId: [null, Validators.required],
      manzanaId: [null],
      loteId: [null, Validators.required],
      montoReserva: [null, [Validators.required, Validators.min(0.01)]],
      moneda: [null, Validators.required],
      tipoCambio: [null, [Validators.required, Validators.min(0.01)]],
      fechaVencimiento: [null, [Validators.required]],
      observaciones: ['', [Validators.maxLength(500)]],
    });
  }

  public onSave(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      Object.values(this.formGroup.controls).forEach(c => c.markAsDirty());
      this.notification.warning('Completar los campos')
      return;
    }

    const formValue = this.formGroup.getRawValue();

    const payload: CreateReservaDto = {
      clienteId: formValue.clienteId,
      loteId: formValue.loteId,
      montoReserva: formValue.montoReserva,
      tipoCambio: formValue.tipoCambio,
      moneda: formValue.moneda,
      fechaVencimiento: formValue.fechaVencimiento,
      observaciones: formValue.observaciones,
    };
    this.loading = true;
    this.reservaService.createReserva(payload)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: () => {
          this.notification.success('Reserva creada exitosamente');
          this.router.navigate(['/reservas']);
        },
        error: (err) => {
          if (err.status === 409) {
            this.notification.error(err.error?.message || 'Conflicto al reservar');
          } else {
            this.notification.error('Error inesperado al crear reserva');
          }
        }
      });
  }

  public onCancel(): void {
    this.router.navigate(['/reservas']);
  }
}
