import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';
import { ViewRegisterProyectoComponent } from "../../../views/proyectos/view-register-proyecto/view-register-proyecto.component";

@Component({
  selector: 'app-register-proyecto',
  standalone: true,
  imports: [
    ViewRegisterProyectoComponent
  ],
  template: `
    <app-view-register-proyecto
      [proyectoForm]="proyectoFormGroup"
      [proyectoData]="proyectoData || null"
      (Save)="onSaveProyecto()"
    ></app-view-register-proyecto>
  `,
  styles: [`
    
  `]
})
export class RegisterProyectoComponent implements OnInit {
  @Input() proyectoData: IProyecto | null = null;
  public proyectoFormGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private ngModal: NgbActiveModal,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    if (this.proyectoData) {
      this.proyectoFormGroup.patchValue(this.proyectoData);
    }
  }

  private buildForm(): void {
    this.proyectoFormGroup = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      departamento: ['', [Validators.required, Validators.maxLength(120)]],
      provincia: ['', [Validators.maxLength(120)]],
      distrito: ['', [Validators.maxLength(120)]],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
      descripcion: ['', [Validators.maxLength(500)]]
    });
  }

  public onSaveProyecto(): void {
    if (this.proyectoFormGroup.invalid) {
      this.proyectoFormGroup.markAllAsTouched();
      this.notification.warning('Revise los campos obligatorios.');
      return;
    }

    const formValue = this.proyectoFormGroup.getRawValue();
    const isEditMode = !!formValue.id;

    // Quitamos 'id' de los datos que enviamos a la API 
    // ya que el backend no lo admite en el cuerpo del POST/PATCH
    const { id, ...payload } = formValue;

    // Decidimos qué servicio llamar
    const request$ = isEditMode
      ? this.proyectoService.updateProyecto(id, payload)
      : this.proyectoService.createProyecto(payload);

    request$.subscribe({
      next: () => {
        const msg = isEditMode ? 'Proyecto actualizado' : 'Proyecto creado exitosamente';
        this.notification.success(msg);
        this.ngModal.close(true);
      },
      error: (err) => {
        // Manejo específico para error 409 (Conflicto de nombre único)
        if (err.status === 409) {
          this.notification.error('Ya existe un proyecto con este nombre.');
          this.proyectoFormGroup.get('nombre')?.setErrors({ duplicate: true });
        } else {
          this.notification.error(err.error?.message || 'Error inesperado.');
        }
      }
    });
  }

}