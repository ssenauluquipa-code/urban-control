import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
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

interface FilePreview {
  file: File;
  previewUrl: string;
}

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

export class ViewRegisterLotesComponent implements OnDestroy {

  @Input() loteForm!: FormGroup;
  @Input() loteData: ILote | null = null;

  private _pendingFiles: File[] = [];
  public pendingFilesPreview: FilePreview[] = [];

  @Input()
  set pendingFiles(files: File[]) {
    this.revokePendingPreviews();
    this._pendingFiles = files || [];
    this.pendingFilesPreview = this._pendingFiles.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file)
    }));
  }

  get pendingFiles(): File[] {
    return this._pendingFiles;
  }

  @Output() fileSelected = new EventEmitter<File>();
  @Output() deleteImage = new EventEmitter<string>();
  @Output() removePendingFile = new EventEmitter<number>();

  ngOnDestroy(): void {
    this.revokePendingPreviews();
  }

  private revokePendingPreviews(): void {
    this.pendingFilesPreview.forEach(item => URL.revokeObjectURL(item.previewUrl));
    this.pendingFilesPreview = [];
  }

  // Getters
  get numero() { return this.loteForm.get('numero') as FormControl<number | null>; }
  get areaM2() { return this.loteForm.get('areaM2') as FormControl<number | null>; }
  get precioReferencial() { return this.loteForm.get('precioReferencial') as FormControl<number | null>; }
  get comision() { return this.loteForm.get('comision') as FormControl<number | null>; }
  get observaciones() { return this.loteForm.get('observaciones') as FormControl<string | null>; }
  get norte() { return this.loteForm.get('dimensionNorte') as FormControl<number | null>; }
  get sur() { return this.loteForm.get('dimensionSur') as FormControl<number | null>; }
  get este() { return this.loteForm.get('dimensionEste') as FormControl<number | null>; }
  get oeste() { return this.loteForm.get('dimensionOeste') as FormControl<number | null>; }

  // 🚀 NUEVO MÉTODO: Conecta con el output del ImageUploaderComponent
  onFileSelected(file: File): void {
    this.fileSelected.emit(file);
  }

}
