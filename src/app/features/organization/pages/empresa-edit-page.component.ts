import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrganizationService } from 'src/app/core/services/configuracion/organization.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { EmpresaFormViewComponent } from '../views/empresa-form-view/empresa-form-view.component';
import { concatMap } from 'rxjs/operators';
import { of } from 'rxjs';

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
      <app-empresa-form-view [form]="form" [logoUrl]="logoUrl"
        (imageUpdated)="onLogoUpload($event)" (imageDeleted)="onLogoDelete()"></app-empresa-form-view>
    </app-page-container>
  `
})
export class EmpresaEditPageComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  isSaving = false;

  logoUrl: string | '' = '';
  logoFile: File | '' = '';
  logoDeleted = false

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
      logoUrl: ['']
    });
  }

  onLogoUpload(file: File): void {
    this.logoFile = file;
    this.logoDeleted = false;

    // preview inmediato
    this.logoUrl = URL.createObjectURL(file);
  }

  private loadFromState(): void {
    const state = history.state;
    if (state && state.empresa) {
      console.log("estados ", state.empresa);
      this.form.patchValue(state.empresa);
      this.logoUrl = state.empresa.logoUrl || '';
    } else {
      // Si no hay estado, cargamos de la API
      this.empresaService.getEmpresa().subscribe(empresa => {
        console.log("datos ", empresa);
        this.form.patchValue(empresa);
        this.logoUrl = empresa.logoUrl || '';
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/configuracion/empresa']);
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSaving = true;

    // Extraemos el logoUrl para que no se envíe en el body del PATCH, ya que el backend lo rechaza.
    const { logoUrl, ...empresaData } = this.form.value;

    // Encadenamos la actualización de datos con la del logo para tratarlo como una sola acción
    this.empresaService.updateEmpresa(empresaData).pipe(
      concatMap(() => {
        if (this.logoDeleted) {
          return this.empresaService.deleteLogo();
        }
        if (this.logoFile) {
          return this.empresaService.uploadLogo(this.logoFile);
        }
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.notificationService.success('Configuración de empresa guardada exitosamente');
        this.finishSave();
      },
      error: () => {
        this.notificationService.error('Ocurrió un error al guardar los cambios');
        this.isSaving = false;
      }
    });
  }

  onLogoDelete(): void {
    this.logoFile = '';
    this.logoDeleted = true;
    this.logoUrl = '';
  }

  private finishSave() {
    this.isSaving = false;
    this.router.navigate(['/configuracion/empresa']);
  }
}
