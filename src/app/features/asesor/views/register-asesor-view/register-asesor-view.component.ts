import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { SelectGenderComponent } from "src/app/shared/components/atoms/select-gender.component";
import { SelectDocumentTypeComponent } from "src/app/shared/components/atoms/select-document-type.component";
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";
import { InputDocumentoComponent } from "src/app/shared/components/atoms/input-documento/input-documento.component";
import { SelectExpedidoComponent } from "src/app/shared/components/atoms/select-expedido.component";
import { InputNumberComponent } from "src/app/shared/components/atoms/input-number/input-number.component";
import { SelectEstadoCivilComponent } from "src/app/shared/components/atoms/select-estado-civil.component";
import { InputTextareaComponent } from "src/app/shared/components/atoms/input-textarea/input-textarea.component";
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';

@Component({
  selector: 'app-register-asesor-view',
  standalone: true,
  imports: [FormFieldComponent, InputTextComponent,
    InputDateComponent, SelectGenderComponent,
    SelectDocumentTypeComponent, InputDocumentoComponent, SelectExpedidoComponent, InputNumberComponent, SelectEstadoCivilComponent, InputTextareaComponent, CardContainerComponent],
  templateUrl: './register-asesor-view.component.html',
  styleUrl: './register-asesor-view.component.scss'
})
export class RegisterAsesorViewComponent {

  @Input() form!: FormGroup;
  @Input() loading = false;

  // Getters para accesos fáciles en el HTML
  get NombreCompleto() { return this.form.get('nombreCompleto') as FormControl; }
  get TipoDocumento() { return this.form.get('tipoDocumento') as FormControl; }
  get NroDocumento() { return this.form.get('nroDocumento') as FormControl; }
  get Complemento() { return this.form.get('complemento') as FormControl; }
  get Genero() { return this.form.get('genero') as FormControl; }
  get FechaNacimiento() { return this.form.get('fechaNacimiento') as FormControl; }
  get Telefono() { return this.form.get('telefono') as FormControl; }
  get Email() { return this.form.get('email') as FormControl; }
  get EstadoCivil() { return this.form.get('estadoCivil') as FormControl; }
  get Ocupacion() { return this.form.get('ocupacion') as FormControl; }
  get Direccion() { return this.form.get('direccion') as FormControl; }


}
