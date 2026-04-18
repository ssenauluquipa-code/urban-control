import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModalContainerComponent } from "src/app/shared/components/organisms/modal-container/modal-container.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { IManzana } from 'src/app/core/models/manzana/manzana.model';
import { CommonModule } from '@angular/common';
import { InputTextareaComponent } from "src/app/shared/components/atoms/input-textarea/input-textarea.component";

@Component({
  selector: 'app-view-register-manzana',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalContainerComponent,
    InputTextComponent, FormFieldComponent, InputTextareaComponent],
  templateUrl: './view-register-manzana.component.html',
  styleUrl: './view-register-manzana.component.scss'
})
export class ViewRegisterManzanaComponent {

  @Input() manzanaForm!: FormGroup;
  @Input() manzanaData: IManzana | null = null;
  @Output() Save = new EventEmitter<void>();

  get codigo() { return this.manzanaForm.get('codigo') as FormControl; }
  get descripcion() { return this.manzanaForm.get('descripcion') as FormControl; }

}
