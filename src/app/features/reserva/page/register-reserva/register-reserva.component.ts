import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateReservaDto, Moneda } from 'src/app/core/models/reserva.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { ReservaService } from 'src/app/core/services/reserva.service';
import { ModalContainerComponent } from "src/app/shared/components/organisms/modal-container/modal-container.component";
import { RegisterReservaViewComponent } from "../../views/register-reserva-view/register-reserva-view.component";

@Component({
  selector: 'app-register-reserva',
  standalone: true,
  imports: [ModalContainerComponent, RegisterReservaViewComponent],
  template: `
    <app-modal-container
      mainTitleModal="Registrar Reserva"
      (SaveAction)="onSave()"
      (CancelAction)="onCancel()"
    >
      <app-register-reserva-view [reservaForm]="formGroup" [proyectoId]="proyectoId">
      </app-register-reserva-view>
    </app-modal-container>

  `,
  styles: ``
})
export class RegisterReservaComponent implements OnInit {

  public formGroup!: FormGroup;
  public proyectoId: string | null = null;

  private fb = inject(FormBuilder);
  private activeModal = inject(NgbActiveModal);
  private reservaService = inject(ReservaService);
  private notification = inject(NotificationService);
  private globalContext = inject(ProjectStatusGlobalService);

  constructor() {
    this.buildForm();
  }

  ngOnInit(): void {

    // 1. Obtener proyecto del contexto global
    this.proyectoId = this.globalContext.getCurrentProjectId();

    if (!this.proyectoId) {
      this.notification.warning('Seleccione un proyecto primero');
      this.activeModal.dismiss();
    }

    // 2. Valor por defecto
    this.formGroup.patchValue({ moneda: Moneda.BS });
  }

  private buildForm(): void {
    this.formGroup = this.fb.group({
      clienteId: [null, Validators.required],
      manzanaId: [null, Validators.required],
      loteId: [null, Validators.required],
      montoReserva: [null, [Validators.required, Validators.min(1)]],
      moneda: [1],
      fechaVencimiento: [null],
      observaciones: ['']
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
      moneda: formValue.moneda,
      fechaVencimiento: formValue.fechaVencimiento ? new Date(formValue.fechaVencimiento).toISOString() : '',
      observaciones: formValue.observaciones,
    };
    this.reservaService.createReserva(payload).subscribe({
      next: () => {
        this.notification.success('Reserva creada exitosamente');
        this.activeModal.close(true);
      },
      error: (err) => {
        if (err.status === 409) {
          this.notification.error(err.error?.message || 'Conflicto al reservar');
        } else {
          this.notification.error('Error inesperado');
        }
      }
    });
  }

  public onCancel(): void {
    this.activeModal.dismiss();
  }
}
