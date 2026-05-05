import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ClienteService } from 'src/app/core/services/cliente.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from 'src/app/core/services/notification.service';
import { finalize } from 'rxjs';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { SelectDocumentTypeComponent } from 'src/app/shared/components/atoms/select-document-type.component';
import { SelectGenderComponent } from 'src/app/shared/components/atoms/select-gender.component';
import { SelectExpedidoComponent } from 'src/app/shared/components/atoms/select-expedido.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { EGenero, ETipoDocumento } from 'src/app/core/models/cliente.model';
import { InputDocumentoComponent } from 'src/app/shared/components/atoms/input-documento/input-documento.component';

@Component({
  selector: 'app-model-multi-clientes',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ModalContainerComponent,
    FormFieldComponent,
    InputTextComponent,
    SelectDocumentTypeComponent,
    SelectGenderComponent,
    SelectExpedidoComponent,
    InputNumberComponent,
    InputDocumentoComponent
  ],
  templateUrl: './model-multi-clientes.component.html',
  styleUrl: './model-multi-clientes.component.scss'
})
export class ModelMultiClientesComponent implements OnInit {

  private _fb = inject(FormBuilder);
  public activeModal = inject(NgbActiveModal);
  private _clienteService = inject(ClienteService);
  private _notification = inject(NotificationService);

  public clienteForm!: FormGroup;
  public nombrePrellenado = ''; // Recibido desde el select
  public loading = false;
  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.clienteForm = this._fb.group({
      nombreCompleto: [this.nombrePrellenado, [Validators.required]],
      tipoDocumento: [ETipoDocumento.CI, [Validators.required]],
      nroDocumento: ['', [Validators.required, Validators.maxLength(30)]],
      complemento: [null],
      telefono: ['', [Validators.required, Validators.maxLength(30)]],
      genero: [EGenero.MASCULINO, [Validators.required]]
    });
  }

  guardarCliente(): void {
    if (this.clienteForm.invalid) return;

    this.loading = true;
    const nuevoCliente = this.clienteForm.value;
    
    this._clienteService.createClient(nuevoCliente)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res) => {
          this._notification.success('Cliente registrado correctamente');
          this.activeModal.close(res);
        },
        error: (err) => {
          console.error('Error al crear cliente rápido', err);
          this._notification.error('Ocurrió un error al registrar el cliente');
        }
      });
  }

  get NombreCompleto() {
    return this.clienteForm.get('nombreCompleto') as FormControl<string | null>;
  }

  get TipoDocumento() {
    return this.clienteForm.get('tipoDocumento') as FormControl<string | null>;
  }

  get NroDocumento() {
    return this.clienteForm.get('nroDocumento') as FormControl<string | null>;
  }

  get Complemento() {
    return this.clienteForm.get('complemento') as FormControl<string | null>;
  }

  get Telefono() {
    return this.clienteForm.get('telefono') as FormControl<number | null>;
  }

  get Genero() {
    return this.clienteForm.get('genero') as FormControl<string | null>;
  }

}
