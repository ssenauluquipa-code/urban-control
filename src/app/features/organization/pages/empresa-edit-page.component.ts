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
import { EAppModule } from 'src/app/core/config/permissions.enum';
import { UpdateOrganizationDto } from 'src/app/core/models/Empresas/empresa-config.model';

@Component({
  selector: 'app-empresa-edit-page',
  standalone: true,
  imports: [CommonModule, PageContainerComponent, EmpresaFormViewComponent],
  template: `
    <app-page-container
      title="Editar Configuración de Empresa"
      [permissionScope]="EAppModule.EMPRESA"
      [showSave]="true"
      [showBack]="true"
      [loading]="loading"
      (Save)="onSubmit()"
      (Back)="goBack()"
      [showOptions]="false"
    >
      <app-empresa-form-view [form]="form" [logoUrl]="logoUrl"
        (imageUpdated)="onLogoUpload($event)" (imageDeleted)="onLogoDelete()"></app-empresa-form-view>
    </app-page-container>
  `
})
export class EmpresaEditPageComponent implements OnInit {
  public readonly EAppModule = EAppModule;
  form!: FormGroup;
  loading = false;

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
      diasVencimientoReserva: [5, [Validators.required, Validators.min(1)]],
      plazoMaximoMeses: [
        null,
        [Validators.required, Validators.min(1), Validators.max(120)],
      ],
      horaCronDiario: [
        null,
        [Validators.required, Validators.min(0), Validators.max(23)],
      ],
      logoUrl: [''],
      tipoDeCambio: [null, [Validators.required, Validators.min(0)]],

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
      this.form.patchValue(state.empresa);
      this.logoUrl = state.empresa.logoUrl || '';
    } else {
      // Si no hay estado, cargamos de la API
      this.empresaService.getEmpresa().subscribe(empresa => {
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

    this.loading = true;

    const empresaData = this.buildUpdatePayload();

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
      error: (error) => {
        const msg = error.error?.message || 'Ocurrió un error al guardar los cambios';
        this.notificationService.error(msg);
        this.loading = false;
      }
    });
  }

  /**
   * Arma el body del PATCH convirtiendo campos numéricos.
   * `app-input-number` trabaja sobre un input de texto y deja string en el FormControl.
   */
  private buildUpdatePayload(): UpdateOrganizationDto {
    const v = this.form.getRawValue();
    return {
      name: v.name,
      email: v.email,
      address: v.address,
      phone: v.phone,
      currency: v.currency,
      tipoDeCambio: Number(v.tipoDeCambio),
      diasVencimientoReserva: Number(v.diasVencimientoReserva),
      plazoMaximoMeses: Number(v.plazoMaximoMeses),
      horaCronDiario: Number(v.horaCronDiario),
    };
  }

  onLogoDelete(): void {
    this.logoFile = '';
    this.logoDeleted = true;
    this.logoUrl = '';
  }

  private finishSave() {
    this.loading = false;
    this.router.navigate(['/configuracion/empresa']);
  }
}
