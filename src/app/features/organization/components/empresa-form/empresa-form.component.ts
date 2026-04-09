import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldComponent } from '../../../../shared/components/molecules/form-field/form-field.component';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import { InputNumberComponent } from '../../../../shared/components/atoms/input-number/input-number.component';
import { InputTextareaComponent } from '../../../../shared/components/atoms/input-textarea/input-textarea.component';
import { SelectDataComponent } from '../../../../shared/components/atoms/select-data.component';
import { ButtonActionComponent } from '../../../../shared/components/atoms/button-action/button-action.component';
import { Router } from '@angular/router';
import { EmpresaService } from 'src/app/core/services/configuracion/empresa.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { IEmpresaConfig } from 'src/app/core/models/Empresas/empresa-config.model';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormFieldComponent,
    InputTextComponent,
    InputNumberComponent,
    InputTextareaComponent,
    SelectDataComponent,
    ButtonActionComponent,
    PageContainerComponent
  ],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.scss'
})
export class EmpresaFormComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() loading: boolean = false;
  @Output() save = new EventEmitter<void>();

  currenciesList = [
    { value: 'Bs', label: 'Bolivianos (Bs)' },
    { value: 'USD', label: 'Dólares (USD)' }
  ];

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private empresaService = inject(EmpresaService);
  private notificationService = inject(NotificationService);

  private stateData: IEmpresaConfig | null = null;

  ngOnInit(): void {
    if (!this.form) {
      this.initForm();
      this.loadFromState();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombreComercial: ['', [Validators.required]],
      razonSocial: ['', [Validators.required]],
      nit: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      telefono: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      diasReservaVencimiento: [3, [Validators.required, Validators.min(1)]],
      monedaSimbolo: ['Bs', [Validators.required]],
    });
  }

  private loadFromState(): void {
    const state = history.state;
    if (state && state.empresa) {
      this.stateData = state.empresa;
      this.form.patchValue(this.stateData!);
    }
  }

  goBack(): void {
    this.router.navigate(['/configuracion/empresa']);
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  onSubmit(): void {
    if (this.form.valid && !this.loading) {
      if (this.save.observers.length > 0) {
        this.save.emit();
      } else {
        this.updateEmpresa();
      }
    }
  }

  private updateEmpresa(): void {
    if (!this.form.valid) return;

        this.loading = true;
    
    // Obtenemos los valores del formulario
    const values = this.form.value;
    // Construimos el objeto respetando lo que la API espera 
    // e incluyendo razonSocial para cumplir con el contrato de IEmpresaConfig
    const datosParaEnviar: IEmpresaConfig = {
      ...this.stateData, // Esto mantiene el ID si existe
      nombreComercial: values.nombreComercial,
      razonSocial: values.razonSocial, // ¡Faltaba este en tu mapeo manual!
      nit: values.nit,
      direccion: values.direccion,
      telefono: values.telefono,
      email: values.email,
      diasReservaVencimiento: values.diasReservaVencimiento,
      monedaSimbolo: values.monedaSimbolo,
    };

    this.empresaService.updateEmpresa(datosParaEnviar).subscribe({
      next: () => {
        this.loading = false;
        this.notificationService.success('Configuración actualizada correctamente');
        this.router.navigate(['/configuracion/empresa']);
      },
      error: () => {
        this.loading = false;
        this.notificationService.error('Error al actualizar la configuración');
      },
    });
  }
}
