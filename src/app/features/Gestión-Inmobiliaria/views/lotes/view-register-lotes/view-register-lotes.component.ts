import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { InputTextareaComponent } from 'src/app/shared/components/atoms/input-textarea/input-textarea.component';
import { ILote } from 'src/app/core/models/lote/lote.model';
import { NzCardModule } from "ng-zorro-antd/card";
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { ImageUploaderComponent } from "src/app/shared/components/atoms/image-uploader/image-uploader.component";
import { ImageDisplayComponent } from 'src/app/shared/components/atoms/image-display/image-display.component';

@Component({
  selector: 'app-view-register-lotes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzCardModule,
    FormFieldComponent,
    InputNumberComponent,
    InputTextareaComponent,
    CardContainerComponent,
    ImageUploaderComponent,
    ImageDisplayComponent
  ],
  templateUrl: './view-register-lotes.component.html',
  styleUrl: './view-register-lotes.component.scss'
})
export class ViewRegisterLotesComponent {

  @Input() loteForm!: FormGroup;
  @Input() loteData: ILote | null = null;
  @Input() pendingFiles: File[] = [];

  @Output() fileSelected = new EventEmitter<File>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() removePendingFile = new EventEmitter<number>();

  // Getters
  get numero() { return this.loteForm.get('numero') as FormControl; }
  get areaM2() { return this.loteForm.get('areaM2') as FormControl; }
  get precioReferencial() { return this.loteForm.get('precioReferencial') as FormControl; }
  get comision() { return this.loteForm.get('comision') as FormControl; }
  get observaciones() { return this.loteForm.get('observaciones') as FormControl; }
  get norte() { return this.loteForm.get('dimensionNorte') as FormControl; }
  get sur() { return this.loteForm.get('dimensionSur') as FormControl; }
  get este() { return this.loteForm.get('dimensionEste') as FormControl; }
  get oeste() { return this.loteForm.get('dimensionOeste') as FormControl; }

  // 🚀 NUEVO MÉTODO: Conecta con el output del ImageUploaderComponent
  onFileSelected(file: File): void {
    this.fileSelected.emit(file);
  }

  // Helper para crear URL de previsualización del objeto File
  getFilePreview(file: File): string {
    return URL.createObjectURL(file);
  }

}
