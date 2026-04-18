import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { ModalContainerComponent } from "src/app/shared/components/organisms/modal-container/modal-container.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { InputTextareaComponent } from "src/app/shared/components/atoms/input-textarea/input-textarea.component";
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';

@Component({
  selector: 'app-view-register-proyecto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSelectModule,
    NzCardModule,
    FormFieldComponent,
    ModalContainerComponent,
    InputTextComponent,
    InputTextareaComponent,
    CardContainerComponent
  ],
  templateUrl: './view-register-proyecto.component.html',
  styleUrl: './view-register-proyecto.component.scss'
})
export class ViewRegisterProyectoComponent {

  @Input() proyectoForm!: FormGroup;
  @Input() proyectoData: IProyecto | null | undefined;
  @Output() Save = new EventEmitter<void>();

  // Getters para acceso fácil en el HTML
  get nombre() { return this.proyectoForm.get('nombre') as FormControl; }
  get direccion() { return this.proyectoForm.get('direccion') as FormControl; }
  get departamento() { return this.proyectoForm.get('departamento') as FormControl; }
  get provincia() { return this.proyectoForm.get('provincia') as FormControl; }
  get distrito() { return this.proyectoForm.get('distrito') as FormControl; }
  get descripcion() { return this.proyectoForm.get('descripcion') as FormControl; }

}
