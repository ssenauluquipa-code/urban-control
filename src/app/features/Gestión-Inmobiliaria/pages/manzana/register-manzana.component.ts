import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateManzanaDto, IManzana, UpdateManzanaDto } from 'src/app/core/models/manzana/manzana.model';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ManzanaService } from 'src/app/core/services/proyectos/manzana.service';
import { ViewRegisterManzanaComponent } from "../../views/manzana/view-register-manzana/view-register-manzana.component";

@Component({
  selector: 'app-register-manzana',
  standalone: true,
  imports: [ViewRegisterManzanaComponent],
  template: `
    <app-view-register-manzana
      [manzanaForm]="manzanaFormGroup"
      [manzanaData]="manzanaData"
      (Save)="onSaveManzana()">
    </app-view-register-manzana>
  `,
  styles: ``
})
export class RegisterManzanaComponent implements OnInit {

  @Input() manzanaData: IManzana | null = null;
  @Input() proyectoId = ''; // Recibido desde la lista

  public manzanaFormGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private manzanaService: ManzanaService,
    private ngModal: NgbActiveModal,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    if (this.manzanaData) {
      this.manzanaFormGroup.patchValue(this.manzanaData);
    }
  }

  private buildForm(): void {
    this.manzanaFormGroup = this.fb.group({
      id: [null],
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      descripcion: ['', [Validators.maxLength(300)]],
      proyectoId: [this.proyectoId, [Validators.required]] // Hidden field for logic
    });
  }

  public onSaveManzana(): void {
    if (this.manzanaFormGroup.invalid) {
      this.manzanaFormGroup.markAllAsTouched();
      return;
    }

    const formValue = this.manzanaFormGroup.getRawValue();
    const isEditMode = !!formValue.id;

    if (isEditMode) {
      // --- UPDATE ---
      const payload: UpdateManzanaDto = {
        codigo: formValue.codigo,
        descripcion: formValue.descripcion
      };
      this.manzanaService.updateManzana(formValue.id, payload).subscribe({
        next: () => {
          this.notification.success('Manzana actualizada');
          this.ngModal.close(true);
        },
        error: (err) => {
          if (err.status === 409) this.notification.error('El código de manzana ya existe en este proyecto.');
          else this.notification.error('Error al actualizar');
        }
      });
    } else {
      // --- CREATE ---
      const payload: CreateManzanaDto = {
        proyectoId: formValue.proyectoId,
        codigo: formValue.codigo,
        descripcion: formValue.descripcion
      };
      this.manzanaService.createManzana(payload).subscribe({
        next: () => {
          this.notification.success('Manzana creada exitosamente');
          this.ngModal.close(true);
        },
        error: (err) => {
          if (err.status === 409) this.notification.error('El código de manzana ya existe en este proyecto.');
          else this.notification.error('Error al crear');
        }
      });
    }
  }

}
