import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { SelectDataComponent } from "src/app/shared/components/atoms/select-data.component";
import { SelectGenderComponent } from "src/app/shared/components/atoms/select-gender.component";
import { SelectDocumentTypeComponent } from "src/app/shared/components/atoms/select-document-type.component";
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";

@Component({
  selector: 'app-register-asesor-view',
  standalone: true,
  imports: [FormFieldComponent, InputTextComponent, SelectDataComponent, InputDateComponent, SelectGenderComponent, SelectDocumentTypeComponent],
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
  get Genero() { return this.form.get('genero') as FormControl; }
  get FechaNacimiento() { return this.form.get('fechaNacimiento') as FormControl; }
  get Telefono() { return this.form.get('telefono') as FormControl; }
  get Email() { return this.form.get('email') as FormControl; }

}
