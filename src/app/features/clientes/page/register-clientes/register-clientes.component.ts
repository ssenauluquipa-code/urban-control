import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { EGenero, ETipoDocumento } from 'src/app/core/models/cliente.model';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { FormClientesViewComponent } from "../../views/form-clientes-view/form-clientes-view.component";

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

  public form!: FormGroup;
  public isEditMode = false;
  public loading = false;
  private clienteId: string | null = null;

  ngOnInit(): void {
    this.buildForm();
    this.checkEditMode();
  }

  // Preparamos las opciones para app-select-data
  // Convertimos los Enums en arrays de objetos { value: 'VALOR', label: 'Valor' }
  public generoOptions = Object.values(EGenero).map(val => ({
    value: val,
    label: val.charAt(0) + val.slice(1).toLowerCase()
  }));

  public tipoDocOptions = Object.values(ETipoDocumento).map(val => ({
    value: val,
    label: val
  }));

  private buildForm(): void {
    this.form = this.fb.group({
      nombreCompleto: ['', Validators.required],
      tipoDocumento: [ETipoDocumento.CI, Validators.required],
      nroDocumento: ['', Validators.required],
      complemento: [''],
      numeroReferencia: [''],
      genero: [EGenero.MASCULINO, Validators.required],
      fechaNacimiento: [null, Validators.required],
      telefono: [''],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required]
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
    const payload = {
      ...value,
      fechaNacimiento: value.fechaNacimiento ? new Date(value.fechaNacimiento).toISOString() : null
    };

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
