import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { SelectProjectsComponent } from "src/app/shared/components/atoms/select-projects.component";

@Component({
  selector: 'app-view-register-lotes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalContainerComponent,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    InputTextComponent,
    InputNumberComponent,
    FormFieldComponent,
    SelectProjectsComponent
],
  templateUrl: './view-register-lotes.component.html',
  styleUrl: './view-register-lotes.component.scss'
})
export class ViewRegisterLotesComponent {
  @Input() loteForm!: FormGroup;
  @Input() loteData: any;
  @Output() onSaveLote = new EventEmitter<void>();

  get id() { return this.loteForm.get('id') as FormControl<string | null>; }
  get numeroLote() { return this.loteForm.get('numeroLote') as FormControl<string>; }
  get manzana() { return this.loteForm.get('manzana') as FormControl<string>; }
  get superficieM2() { return this.loteForm.get('superficieM2') as FormControl<number>; }
  get estado() { return this.loteForm.get('estado') as FormControl<string>; }
  get proyectoId() { return this.loteForm.get('proyectoId') as FormControl<string>; }
}
