import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { ILote } from 'src/app/core/models/lote/lote.model';
import { NzCardModule } from "ng-zorro-antd/card";
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
@Component({
  selector: 'app-view-register-lotes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalContainerComponent,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzCardModule, // Añadimos Card
    FormFieldComponent
  ],
  templateUrl: './view-register-lotes.component.html',
  styleUrl: './view-register-lotes.component.scss'
})
export class ViewRegisterLotesComponent {

  @Input() loteForm!: FormGroup;
  @Input() loteData: ILote | null = null;
  @Output() Save = new EventEmitter<void>();

  // Eventos nuevos para interacción con archivos
  @Output() filesSelected = new EventEmitter<FileList>();
  @Output() deleteImage = new EventEmitter<string>();

  get numero() { return this.loteForm.get('numero') as FormControl; }
  get areaM2() { return this.loteForm.get('areaM2') as FormControl; }
  get precioReferencial() { return this.loteForm.get('precioReferencial') as FormControl; }
  get comision() { return this.loteForm.get('comision') as FormControl; }
  get observaciones() { return this.loteForm.get('observaciones') as FormControl; }
  get norte() { return this.loteForm.get('dimensionNorte') as FormControl; }
  get sur() { return this.loteForm.get('dimensionSur') as FormControl; }
  get este() { return this.loteForm.get('dimensionEste') as FormControl; }
  get oeste() { return this.loteForm.get('dimensionOeste') as FormControl; }

  // Helper para el input file
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.filesSelected.emit(input.files);
    }
  }

}
