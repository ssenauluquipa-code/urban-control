import { Component, OnInit } from '@angular/core';
import { ViewRegisterLotesComponent } from '../views/view-register-lotes/view-register-lotes.component';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { LoteService } from 'src/app/core/services/gestion-inmobiliaria/lote.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from 'src/app/core/services/notification.service';
import { TLoteEstado } from 'src/app/core/models/gestion-inmobiliaria/lotes.model';

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
    public loteData: any; // Aquí recibirás el objeto ILote desde la lista

    get id() { return this.loteFormGroup.get('id') as FormControl<string | null>; }
    get numeroLote() { return this.loteFormGroup.get('numeroLote') as FormControl<string>; }
    get manzana() { return this.loteFormGroup.get('manzana') as FormControl<string>; }
    get superficieM2() { return this.loteFormGroup.get('superficieM2') as FormControl<number>; }
    get estado() { return this.loteFormGroup.get('estado') as FormControl<TLoteEstado>; }
    get proyectoId() { return this.loteFormGroup.get('proyectoId') as FormControl<string>; }

    constructor(
        private fb: FormBuilder,
        private loteService: LoteService,
        private ngModal: NgbActiveModal,
        private notification: NotificationService
    ) {}

    ngOnInit(): void {
        this.buildForm();
        if (this.loteData) {
            this.loteFormGroup.patchValue(this.loteData);
        }
    }

    private buildForm(): void {
        this.loteFormGroup = this.fb.group({
            id: [null],
            numeroLote: ['', [Validators.required]],
            manzana: ['', [Validators.required]],
            superficieM2: [0, [Validators.min(1)]],
            estado: ['Disponible'],
            proyectoId: ['',[Validators.required]] // Tu GUID
        });
    }

    public onSaveLote(): void {
    if (this.loteFormGroup.valid) {
            const data = this.loteFormGroup.value;

            // 🔍 LÓGICA DE DISTINCIÓN:
            if (data.id) {
                // 1. SI TIENE ID -> LLAMAR A ACTUALIZAR
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
                // 2. NO TIENE ID -> LLAMAR A CREAR (Como lo tenías antes)
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
