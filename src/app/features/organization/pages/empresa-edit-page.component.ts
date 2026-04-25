import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrganizationService } from 'src/app/core/services/configuracion/organization.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { EmpresaFormViewComponent } from '../views/empresa-form-view/empresa-form-view.component';
import { UpdateOrganizationDto } from 'src/app/core/models/Empresas/empresa-config.model';

@Component({
  selector: 'app-empresa-edit-page',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, EmpresaFormViewComponent],
  template: `
    <app-page-container
      title="Editar Configuración de Empresa"
      permissionScope="empresa"
      [showSave]="true"
      [showBack]="true"
      (Save)="onSubmit()"
      (Back)="goBack()"
    >
      <app-empresa-form-view [form]="form"></app-empresa-form-view>
    </app-page-container>
  `
})
export class EmpresaEditPageComponent implements OnInit {
  form!: FormGroup;
  loading = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private empresaService = inject(OrganizationService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.initForm();
    this.loadFromState();
  }

  private initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      currency: ['BS', [Validators.required]],
      timezone: ['America/La_Paz', [Validators.required]],
      diasVencimientoReserva: [5, [Validators.required, Validators.min(1)]],
      plazoMaximoMeses: [18, [Validators.required, Validators.min(1)]],
      horaCronDiario: [8, [Validators.required, Validators.min(0), Validators.max(23)]],
    });
  }

  private loadFromState(): void {
    const state = history.state;
    if (state && state.empresa) {
      this.form.patchValue(state.empresa);
    } else {
      // Si no hay estado, cargamos de la API
      this.empresaService.getEmpresa().subscribe(empresa => {
        this.form.patchValue(empresa);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/configuracion/empresa']);
  }

  onSubmit(): void {
    if (this.form.valid && !this.loading) {
      this.updateEmpresa();
    } else {
      // Marcar campos como sucios para mostrar errores
      Object.values(this.form.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  private updateEmpresa(): void {
    this.loading = true;
    const values = this.form.value;

    const dto: UpdateOrganizationDto = {
      ...values
    };

    this.empresaService.updateEmpresa(dto).subscribe({
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
