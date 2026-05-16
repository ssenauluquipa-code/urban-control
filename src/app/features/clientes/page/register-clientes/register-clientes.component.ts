import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EEstadoCivil, EGenero, ETipoDocumento } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { FormClientesViewComponent } from "../../views/form-clientes-view/form-clientes-view.component";
import { EAppModule } from 'src/app/core/config/permissions.enum';

@Component({
  selector: 'app-register-clientes',
  standalone: true,
  imports: [PageContainerComponent, FormClientesViewComponent],
  templateUrl: './register-clientes.component.html',
  styleUrl: './register-clientes.component.scss'
})
export class RegisterClientesComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clienteService = inject(ClienteService);
  private notification = inject(NotificationService);

  public readonly EAppModule = EAppModule;
  public form!: FormGroup;
  public isEditMode = false;
  public loading = false;
  private clienteId: string | null = null;

  ngOnInit(): void {
    this.buildForm();
    this.checkEditMode();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.maxLength(180)]],
      tipoDocumento: [ETipoDocumento.CI, [Validators.required]],
      nroDocumento: ['', [Validators.required, Validators.maxLength(30)]],
      complemento: ['', [Validators.required, Validators.maxLength(20)]],
      numeroReferencia: ['', [Validators.maxLength(50)]],
      genero: [EGenero.MASCULINO, Validators.required],
      fechaNacimiento: [null],
      fotoUrl: [''],  // Solo para previsualización, no se envía al backend
      estadoCivil: [EEstadoCivil.SOLTERO, Validators.required],
      ocupacion: ['', [Validators.required, Validators.maxLength(150)]],
      telefono: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', Validators.email],
      direccion: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  private checkEditMode(): void {
    this.clienteId = this.route.snapshot.paramMap.get('id');
    if (this.clienteId) {
      this.isEditMode = true;
      this.loadData();
    }
  }

  private loadData(): void {
    if (!this.clienteId) return;
    this.loading = true;
    this.clienteService.getClientById(this.clienteId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          const birthDate = data.fechaNacimiento ? new Date(data.fechaNacimiento) : null;
          this.form.patchValue({ ...data, fechaNacimiento: birthDate });
        },
        error: () => {
          this.notification.error('Error al cargar datos');
          this.goBack();
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.values(this.form.controls).forEach(c => c.markAsDirty());
      this.notification.warning('Complete los campos obligatorios');
      return;
    }

    this.loading = true;
    const value = this.form.value;

    // Construir payload SIN fotoUrl (la foto se gestiona desde la lista con endpoints dedicados)
    const payload = {
      ...value,
      fechaNacimiento: value.fechaNacimiento ? new Date(value.fechaNacimiento).toISOString() : null
    };
    delete payload.fotoUrl;

    // Limpiar campos opcionales vacíos
    if (!payload.email) delete payload.email;
    if (!payload.numeroReferencia) delete payload.numeroReferencia;

    const request$ = this.isEditMode
      ? this.clienteService.updateClient(this.clienteId!, payload)
      : this.clienteService.createClient(payload);

    request$.pipe(finalize(() => this.loading = false)).subscribe({
      next: () => {
        this.notification.success(this.isEditMode ? 'Cliente actualizado' : 'Cliente creado');
        this.goBack();
      },
      error: (err) => {
        if (err.status === 409) this.notification.error('El documento ya existe');
        else this.notification.error('Error al guardar');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clientes']);
  }
}
