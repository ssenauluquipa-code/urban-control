import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';
import { ViewRegisterProyectoComponent } from "../../../views/proyectos/view-register-proyecto/view-register-proyecto.component";
import { BOLIVIA_UBICACION } from 'src/app/core/constants/bolivia-data';

@Component({
  selector: 'app-register-proyecto',
  standalone: true,
  imports: [ViewRegisterProyectoComponent],
  template: `
    <app-view-register-proyecto
      [proyectoForm]="proyectoFormGroup"
      [proyectoData]="proyectoData || null"
      [provinciasList]="provinciasFiltradas"
      [loading]="loading"
      (Save)="onSaveProyecto()"
    ></app-view-register-proyecto>
  `
})
export class RegisterProyectoComponent implements OnInit {
  @Input() proyectoData: IProyecto | null = null;
  public proyectoFormGroup!: FormGroup;
  public provinciasFiltradas: string[] = []; // Lista que pasamos al View
  public loading = false;

  constructor(
    private fb: FormBuilder,
    private proyectoService: ProyectoService,
    private ngModal: NgbActiveModal,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.setupLocationSubscriptions(); // Inicializar escuchas de ubicación

    if (this.proyectoData) {
      this.proyectoFormGroup.patchValue(this.proyectoData);
      // Al editar, debemos cargar las provincias del departamento guardado
      this.updateProvincias(this.proyectoData.departamento);
    }
  }

  private buildForm(): void {
    this.proyectoFormGroup = this.fb.group({
      id: [null],
      nombre: ['', [Validators.required, Validators.maxLength(120)]],
      departamento: [null, [Validators.required]],
      provincia: [null, [Validators.required]],
      distrito: ['', [Validators.maxLength(120)]],
      direccion: ['', [Validators.required, Validators.maxLength(250)]],
      descripcion: ['', [Validators.maxLength(500)]]
    });
  }

  private setupLocationSubscriptions(): void {
    // Escuchar cambios en departamento para actualizar provincias
    this.proyectoFormGroup.get('departamento')?.valueChanges.subscribe((depto: string | null) => {
      this.updateProvincias(depto);
      // Resetear provincia al cambiar departamento para evitar datos inconsistentes
      this.proyectoFormGroup.get('provincia')?.setValue(null, { emitEvent: false });
    });
  }

  private updateProvincias(departamentoNombre: string | null | undefined): void {
    if (!departamentoNombre) {
      this.provinciasFiltradas = [];
      return;
    }
    const data = BOLIVIA_UBICACION.find(d => d.nombre === departamentoNombre);
    this.provinciasFiltradas = data ? data.provincias : [];
  }

  public onSaveProyecto(): void {
    if (this.proyectoFormGroup.invalid) {
      this.proyectoFormGroup.markAllAsTouched();
      this.notification.warning('Revise los campos obligatorios.');
      return;
    }

    this.loading = true;
    const formValue = this.proyectoFormGroup.getRawValue();
    const isEditMode = !!formValue.id;
    const { id, ...payload } = formValue;

    const request$ = isEditMode
      ? this.proyectoService.updateProyecto(id, payload)
      : this.proyectoService.createProyecto(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        const msg = isEditMode ? 'Proyecto actualizado' : 'Proyecto creado exitosamente';
        this.notification.success(msg);
        this.ngModal.close(true);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 409) {
          this.notification.error('Ya existe un proyecto con este nombre.');
        } else {
          this.notification.error(err.error?.message || 'Error inesperado.');
        }
      }
    });
  }
}
