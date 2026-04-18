import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { SelectGenderComponent } from "src/app/shared/components/atoms/select-gender.component";
import { SelectDocumentTypeComponent } from "src/app/shared/components/atoms/select-document-type.component";
import { InputTextareaComponent } from "src/app/shared/components/atoms/input-textarea/input-textarea.component";
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
@Component({
  selector: 'app-form-clientes-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,
    FormFieldComponent, InputTextComponent, SelectGenderComponent, SelectDocumentTypeComponent,
    InputTextareaComponent, InputDateComponent, CardContainerComponent],
  templateUrl: './form-clientes-view.component.html',
  styleUrl: './form-clientes-view.component.scss'
})
export class FormClientesViewComponent {

  @Input() formInput!: FormGroup;

  // --- Getters ---
  get NombreCompleto() { return this.formInput.get('nombreCompleto') as FormControl; }
  get TipoDocumento() { return this.formInput.get('tipoDocumento') as FormControl; }
  get NroDocumento() { return this.formInput.get('nroDocumento') as FormControl; }
  get Complemento() { return this.formInput.get('complemento') as FormControl; }
  get NumeroReferencia() { return this.formInput.get('numeroReferencia') as FormControl; }
  get Genero() { return this.formInput.get('genero') as FormControl; }
  get FechaNacimiento() { return this.formInput.get('fechaNacimiento') as FormControl; }
  get Telefono() { return this.formInput.get('telefono') as FormControl; }
  get Email() { return this.formInput.get('email') as FormControl; }
  get Direccion() { return this.formInput.get('direccion') as FormControl; }

}
