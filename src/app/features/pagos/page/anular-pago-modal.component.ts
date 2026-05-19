import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PagosService } from 'src/app/core/services/pagos.service';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';

@Component({
  selector: 'app-anular-pago-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalContainerComponent,
  ],
  template: `
    <app-modal-container
      [mainTitleModal]="'Anular Pago'"
      [saveButtonName]="'Anular Pago'"
      [saveButtonIcon]="'stop'"
      [saveButtonDanger]="true"
      [loading]="loading"
      (SaveAction)="confirmarAnulacion()"
      (CancelAction)="activeModal.dismiss()"
    >
      <form [formGroup]="form" class="py-2">
        <p class="mb-3 text-dark">
          ¿Estás seguro de anular el pago
          <strong>#{{ codigoPago || '---' }}</strong> de la venta?
        </p>
        <div class="form-group mb-0">
          <label
            for="motivoAnulacion"
            class="form-label font-weight-bold text-muted small"
            >Motivo de Anulación *</label
          >
          <textarea
            id="motivoAnulacion"
            class="form-control"
            rows="3"
            placeholder="Ej. Pago registrado con fecha incorrecta o monto incorrecto."
            formControlName="motivoAnulacion"
          ></textarea>
          @if(form.get('motivoAnulacion')?.touched &&
              form.get('motivoAnulacion')?.invalid){
          <div           
            class="text-danger small mt-1"
          >
            El motivo de anulación es obligatorio y debe tener al menos 5
            caracteres.
          </div>
          }
          
        </div>
      </form>
    </app-modal-container>
  `,
  styles: ``,
})
export class AnularPagoModalComponent {
  @Input() pagoId = '';
  @Input() codigoPago?: number;

  loading = false;

  private fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);
  private pagosService = inject(PagosService);
  private notification = inject(NotificationService);

  form: FormGroup = this.fb.group({
    motivoAnulacion: ['', [Validators.required, Validators.minLength(5)]],
  });

  confirmarAnulacion(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const motivo = this.form.value.motivoAnulacion;

    this.pagosService
      .anularPago(this.pagoId, motivo)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: () => {
          this.notification.success('Pago anulado exitosamente.');
          this.activeModal.close(true);
        },
        error: (err) => {
          const message = err.error?.message || 'No se pudo anular el pago.';
          this.notification.error(message);
        },
      });
  }
}
