import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FrecuenciaPago, TipoPago, DiaSemanaPago, SelectClienteOutput, CreateVentaPropietarioDto } from 'src/app/core/models/venta.model';

// Componentes locales del feature

// NG-ZORRO
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TipoPagoSelectorComponent } from 'src/app/shared/components/molecules/tipo-pago-selector.component';
import { SelectFrecuenciaPagoComponent } from 'src/app/shared/components/molecules/select-frecuencia-pago.component';
import { ModalidadCalendarioSelectorComponent } from 'src/app/shared/components/molecules/modalidad-calendario-selector.component';
import { SelectDiaSemanaComponent } from 'src/app/shared/components/molecules/select-dia-semana.component';
import { InputDiaPagoComponent } from 'src/app/shared/components/molecules/input-dia-pago.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { InputDateComponent } from 'src/app/shared/components/atoms/input-date/input-date.component';
import { SelectLotesComponent } from 'src/app/shared/components/atoms/select-lotes.component';
import { SelectAsesorComponent } from 'src/app/shared/components/atoms/select-asesor.component';
import { SelectClientesComponent } from 'src/app/shared/components/atoms/select-clientes.component';
import { SelectMonedaComponent } from 'src/app/shared/components/atoms/select-moneda.component';
import { InputTextareaComponent } from 'src/app/shared/components/atoms/input-textarea/input-textarea.component';
import { CurrencyLabelComponent } from "src/app/shared/components/atoms/currency-label/currency-label.component";
import { CardContainerComponent } from "src/app/shared/components/atoms/card-container/card-container.component";
import { SelectDataComponent } from "src/app/shared/components/atoms/select-data.component";

@Component({
  selector: 'app-register-venta-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TipoPagoSelectorComponent,
    SelectFrecuenciaPagoComponent, ModalidadCalendarioSelectorComponent,
    SelectDiaSemanaComponent, InputDiaPagoComponent, InputNumberComponent, FormFieldComponent, NzButtonModule,
    NzInputNumberModule, NzDatePickerModule, InputDateComponent,
    SelectLotesComponent, SelectAsesorComponent, SelectClientesComponent,
    SelectMonedaComponent, InputTextareaComponent, CurrencyLabelComponent, CardContainerComponent, SelectDataComponent],
  templateUrl: './register-venta-view.component.html',
  styleUrl: './register-venta-view.component.scss'
})
export class RegisterVentaViewComponent implements OnInit {

  private cdr = inject(ChangeDetectorRef);

  @Input() form!: FormGroup;
  @Input() loading = false;

  get loteId() { return this.form.get('loteId') as FormControl<string | null>; }
  get asesorId() { return this.form.get('asesorId') as FormControl<string | null>; }
  get reservaId() { return this.form.get('reservaId') as FormControl<string | null>; }
  get tipoPago() { return this.form.get('tipoPago') as FormControl<TipoPago | null>; }
  get moneda() { return this.form.get('moneda') as FormControl<string | null>; }
  get montoTotal() { return this.form.get('montoTotal') as FormControl<number | null>; }
  get cuotaInicial() { return this.form.get('cuotaInicial') as FormControl<number | null>; }
  get frecuenciaPago() { return this.form.get('frecuenciaPago') as FormControl<FrecuenciaPago | null>; }
  get modalidadCalendarioPago() { return this.form.get('modalidadCalendarioPago') as FormControl<string | null>; }
  get diaSemanaPago() { return this.form.get('diaSemanaPago') as FormControl<DiaSemanaPago | null>; }
  get diaPagoMes1() { return this.form.get('diaPagoMes1') as FormControl<number | null>; }
  get diaPagoMes2() { return this.form.get('diaPagoMes2') as FormControl<number | null>; }
  get nroCuotas() { return this.form.get('nroCuotas') as FormControl<number | null>; }
  get fechaVenta() { return this.form.get('fechaVenta') as FormControl<Date | null>; }
  get fechaPagoInicial() { return this.form.get('fechaPagoInicial') as FormControl<Date | null>; }
  get observaciones() { return this.form.get('observaciones') as FormControl<string | null>; }
  get propietarios() { return this.form.get('propietarios') as FormControl<CreateVentaPropietarioDto[] | null>; }

  ngOnInit(): void {
    // Forzar detección de cambios cuando el formulario cambie
    this.form?.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  onClientesChange(event: SelectClienteOutput): void {
    if (Array.isArray(event)) {
      this.form.patchValue({ propietarios: event });
    }
  }

}
