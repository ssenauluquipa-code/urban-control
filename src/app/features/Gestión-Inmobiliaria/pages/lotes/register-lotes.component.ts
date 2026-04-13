import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/core/services/notification.service';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { ILote, TEstadoLote } from 'src/app/core/models/lote/lote.model';
import { ViewRegisterLotesComponent } from '../../views/view-register-lotes/view-register-lotes.component';

@Component({
  selector: 'app-register-lotes',
  standalone: true,
  imports: [ViewRegisterLotesComponent],
  template: `
    <app-view-register-lotes [loteForm]="loteFormGroup"
            [loteData]="loteData"
            (onSaveLote)="onSaveLote()"></app-view-register-lotes>
  `,
  styles: ``
})
export class RegisterLotesComponent implements OnInit {
  public loteFormGroup!: FormGroup;
  public loteData: ILote | null = null;

  get id() { return this.loteFormGroup.get('id') as FormControl<string | null>; }
  get numero() { return this.loteFormGroup.get('numero') as FormControl<number>; }
  get areaM2() { return this.loteFormGroup.get('areaM2') as FormControl<number>; }
  get precioReferencial() { return this.loteFormGroup.get('precioReferencial') as FormControl<number>; }
  get observaciones() { return this.loteFormGroup.get('observaciones') as FormControl<string>; }
  get estado() { return this.loteFormGroup.get('estado') as FormControl<TEstadoLote>; }
  get manzanaId() { return this.loteFormGroup.get('manzanaId') as FormControl<string>; }

  constructor(
    private fb: FormBuilder,
    private loteService: LoteService,
    private ngModal: NgbActiveModal,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    if (this.loteData) {
      this.loteFormGroup.patchValue(this.loteData);
    }
  }

  private buildForm(): void {
    this.loteFormGroup = this.fb.group({
      id: [null],
      numero: [1, [Validators.required, Validators.min(1)]],
      areaM2: [0, [Validators.required, Validators.min(1)]],
      precioReferencial: [0, [Validators.min(0)]],
      observaciones: [''],
      estado: ['DISPONIBLE'],
      manzanaId: ['', [Validators.required]]
    });
  }

  public onSaveLote(): void {
    if (this.loteFormGroup.valid) {
      const data = this.loteFormGroup.value;

      if (data.id) {
        this.loteService.updateLote(data.id, data).subscribe({
          next: () => {
            this.notification.success('El lote se ha actualizado exitosamente.');
            this.ngModal.close(true);
          },
          error: (err) => {
            this.notification.error('Error al intentar actualizar el lote.');
          }
        });
      } else {
        this.loteService.createLote(data).subscribe({
          next: (response) => {
            this.notification.success('El lote se ha registrado exitosamente.');
            this.ngModal.close(true);
          },
          error: (err) => {
            this.notification.error('Error al intentar registrar el lote.');
          }
        });
      }
    } else {
      this.loteFormGroup.markAllAsTouched();
      this.notification.warning('Por favor, revise los campos marcados en rojo.');
    }
  }
}
