import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldComponent } from '../../../../shared/components/molecules/form-field/form-field.component';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import { InputTextareaComponent } from '../../../../shared/components/atoms/input-textarea/input-textarea.component';
import { SelectDataComponent } from '../../../../shared/components/atoms/select-data.component';
import { Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { OrganizationService } from 'src/app/core/services/configuracion/organization.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { IOrganization, UpdateOrganizationDto } from 'src/app/core/models/Empresas/empresa-config.model';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldComponent,
    InputTextComponent,
    InputTextareaComponent,
    SelectDataComponent,
    PageContainerComponent,
    NzFormModule
  ],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.scss'
})
export class EmpresaFormComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() loading= false;
  @Output() save = new EventEmitter<void>();

  currenciesList = [
    { value: 'Bs', label: 'Bolivianos (Bs)' },
    { value: 'USD', label: 'Dólares (USD)' }
  ];

  timezonesList = [
    { value: 'America/La_Paz', label: 'Bolivia (GMT-4)' },
    { value: 'UTC', label: 'UTC' }
  ];

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private empresaService = inject(OrganizationService);

  private notificationService = inject(NotificationService);

  private stateData: IOrganization | null = null;

  ngOnInit(): void {
    if (!this.form) {
      this.initForm();
      this.loadFromState();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      currency: ['Bs', [Validators.required]],
      timezone: ['America/La_Paz', [Validators.required]],
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
    
    const datosParaEnviar: UpdateOrganizationDto = {
      name: values.name,
      email: values.email,
      address: values.address,
      phone: values.phone,
      currency: values.currency,
      timezone: values.timezone,
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
