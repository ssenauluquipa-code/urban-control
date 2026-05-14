import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnInit,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import {
  FrecuenciaPago,
  TipoPago,
  DiaSemanaPago,
  SelectClienteOutput,
  CreateVentaPropietarioDto,
  RolPropietario,
} from "src/app/core/models/venta.model";
import { IReserva } from "src/app/core/models/reserva.model";
import { ILoteByLoteDisponible } from "src/app/core/models/lote/lote.model";

// Componentes locales del feature

// NG-ZORRO
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzInputNumberModule } from "ng-zorro-antd/input-number";
import { NzDatePickerModule } from "ng-zorro-antd/date-picker";
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TipoPagoSelectorComponent } from "src/app/shared/components/molecules/tipo-pago-selector.component";
import { SelectFrecuenciaPagoComponent } from "src/app/shared/components/molecules/select-frecuencia-pago.component";
import { ModalidadCalendarioSelectorComponent } from "src/app/shared/components/molecules/modalidad-calendario-selector.component";
import { SelectDiaSemanaComponent } from "src/app/shared/components/molecules/select-dia-semana.component";
import { InputDiaPagoComponent } from "src/app/shared/components/molecules/input-dia-pago.component";
import { InputNumberComponent } from "src/app/shared/components/atoms/input-number/input-number.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputDateComponent } from "src/app/shared/components/atoms/input-date/input-date.component";
import { SelectLotesComponent } from "src/app/shared/components/atoms/select-lotes.component";
import { SelectClientesComponent } from "src/app/shared/components/atoms/select-clientes.component";
import { SelectMonedaComponent } from "src/app/shared/components/atoms/select-moneda.component";
import { InputTextareaComponent } from "src/app/shared/components/atoms/input-textarea/input-textarea.component";
import { CurrencyLabelComponent } from "src/app/shared/components/atoms/currency-label/currency-label.component";
import { CardContainerComponent } from "src/app/shared/components/atoms/card-container/card-container.component";
import { InputSearchReservaComponent } from "../../components/input-search-reserva.component";
import { ReservaService } from "src/app/core/services/reserva.service";
import { ActivatedRoute } from "@angular/router";


@Component({
  selector: "app-register-venta-view",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TipoPagoSelectorComponent,
    SelectFrecuenciaPagoComponent,
    ModalidadCalendarioSelectorComponent,
    SelectDiaSemanaComponent,
    InputDiaPagoComponent,
    InputNumberComponent,
    FormFieldComponent,
    NzButtonModule,
    NzInputNumberModule,
    NzDatePickerModule,
    InputDateComponent,
    SelectLotesComponent,
    SelectClientesComponent,
    SelectMonedaComponent,
    InputTextareaComponent,
    CurrencyLabelComponent,
    CardContainerComponent,
    InputSearchReservaComponent,
  ],
  templateUrl: "./register-venta-view.component.html",
  styleUrl: "./register-venta-view.component.scss",
})
export class RegisterVentaViewComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private reservaService = inject(ReservaService);
  private route = inject(ActivatedRoute);

  @Input() form!: FormGroup;
  @Input() loading = false;

  public currentReservedLote: ILoteByLoteDisponible | null = null;
  public reservaLabel = '';

  readonly TipoPago = TipoPago;
  readonly FrecuenciaPago = FrecuenciaPago;

  get loteId() {
    return this.form.get("loteId") as FormControl<string | null>;
  }
  get reservaId() {
    return this.form.get("reservaId") as FormControl<string | null>;
  }
  get tipoPago() {
    return this.form.get("tipoPago") as FormControl<TipoPago | null>;
  }
  get moneda() {
    return this.form.get("moneda") as FormControl<string | null>;
  }
  get montoTotal() {
    return this.form.get("montoTotal") as FormControl<number | null>;
  }
  get cuotaInicial() {
    return this.form.get("cuotaInicial") as FormControl<number | null>;
  }
  get frecuenciaPago() {
    return this.form.get(
      "frecuenciaPago",
    ) as FormControl<FrecuenciaPago | null>;
  }
  get modalidadCalendarioPago() {
    return this.form.get("modalidadCalendarioPago") as FormControl<
      string | null
    >;
  }
  get diaSemanaPago() {
    return this.form.get("diaSemanaPago") as FormControl<DiaSemanaPago | null>;
  }
  get diaPagoMes1() {
    return this.form.get("diaPagoMes1") as FormControl<number | null>;
  }
  get diaPagoMes2() {
    return this.form.get("diaPagoMes2") as FormControl<number | null>;
  }
  get nroCuotas() {
    return this.form.get("nroCuotas") as FormControl<number | null>;
  }
  get fechaPagoInicial() {
    return this.form.get("fechaPagoInicial") as FormControl<Date | null>;
  }
  get observaciones() {
    return this.form.get("observaciones") as FormControl<string | null>;
  }
  get propietarios() {
    return this.form.get("propietarios") as FormControl<
      CreateVentaPropietarioDto[] | null
    >;
  }

  get isContado(): boolean {
    return this.tipoPago.value === TipoPago.CONTADO;
  }

  get isCuotas(): boolean {
    return this.tipoPago.value === TipoPago.CUOTAS;
  }

  get montoTotalValue(): number {
    return Number(this.montoTotal.value || 0);
  }

  get cuotaInicialValue(): number {
    return Number(this.cuotaInicial.value || 0);
  }

  get saldoPendienteValue(): number {
    const total = this.montoTotal.value || 0;
    const inicial = this.cuotaInicial.value || 0;
    const saldo = total - inicial;
    return saldo > 0 ? saldo : 0;
  }

  get propietariosValue(): CreateVentaPropietarioDto[] {
    return this.propietarios.value || [];
  }

  get titularPrincipal(): CreateVentaPropietarioDto | null {
    return (
      this.propietariosValue.find((item) => item.rol === "TITULAR") || null
    );
  }

  get cotitularesCount(): number {
    return this.propietariosValue.filter((item) => item.rol === "COTITULAR")
      .length;
  }

  get resumenTipoPago(): string {
    if (this.isContado) {
      return "Pago único, sin cronograma de cuotas.";
    }

    return "Venta financiada con generación de plan de pagos.";
  }

  get resumenCalendario(): string {
    if (!this.isCuotas) {
      return "La venta se completa en un solo pago.";
    }

    if (this.frecuenciaPago.value === FrecuenciaPago.SEMANAL) {
      return this.diaSemanaPago.value
        ? `El cliente pagará cada ${this.diaSemanaPago.value.toLowerCase()}.`
        : "Seleccione el día de pago semanal.";
    }

    if (this.frecuenciaPago.value === FrecuenciaPago.QUINCENAL) {
      if (this.modalidadCalendarioPago.value === "INTERVALO_15_DIAS") {
        return "Las cuotas se generarán en intervalos continuos de 15 días.";
      }

      if (this.modalidadCalendarioPago.value === "DIAS_FIJOS_MES") {
        if (this.diaPagoMes1.value && this.diaPagoMes2.value) {
          return `Las cuotas vencerán los días ${this.diaPagoMes1.value} y ${this.diaPagoMes2.value} de cada mes.`;
        }
        return "Defina los dos días fijos del mes para el pago quincenal.";
      }

      return "Seleccione la modalidad del calendario quincenal.";
    }

    if (
      this.frecuenciaPago.value === FrecuenciaPago.MENSUAL ||
      this.frecuenciaPago.value === FrecuenciaPago.BIMESTRAL ||
      this.frecuenciaPago.value === FrecuenciaPago.TRIMESTRAL
    ) {
      return "El cronograma se generará automáticamente desde la fecha inicial.";
    }

    return "Complete los datos del plan para generar el cronograma.";
  }

  ngOnInit(): void {
    this.checkUrlParams();
  }

  private checkUrlParams(): void {
    this.route.queryParams.subscribe(params => {
      const reservaId = params['reservaId'];
      if (reservaId) {
        this.onReservaSelected({ id: reservaId });
      }
    });
  }

  onClientesChange(event: SelectClienteOutput): void {
    if (Array.isArray(event)) {
      this.form.patchValue({ propietarios: event });
    }
  }

  onReservaSelected(reserva: Partial<IReserva>): void {
    if (!reserva) return;

    // Si recibimos un objeto que parece ser solo de la tabla (no tiene el objeto 'lote' anidado),
    // buscamos el detalle completo para tener toda la información "rica".
    if (!reserva.lote && (reserva.reservaId || reserva.id)) {
      const id = (reserva.reservaId || reserva.id) as string;
      this.reservaService.getReservaById(id).subscribe(fullReserva => {
        this.applyReservaData(fullReserva);
      });
    } else {
      this.applyReservaData(reserva as IReserva);
    }
  }

  private applyReservaData(reserva: IReserva): void {
    const lote = reserva.lote;
    const cliente = reserva.cliente || { id: reserva.clienteId };

    // Construir etiqueta para el buscador de reservas
    const mza = reserva.manzana || lote?.manzana?.codigo || '';
    const nroLote = reserva.numeroLote || lote?.numero || '';
    this.reservaLabel = `#${reserva.codigoReserva} - Mza. ${mza} Lote ${nroLote}`;

    if (lote) {
      // Preparamos el objeto del lote para el selector
      this.currentReservedLote = {
        id: lote.id,
        descripcion: `Lote ${lote.numero} - Mza. ${lote.manzana?.codigo || ''}`,
        nroLote: lote.numero,
        areaM2: lote.areaM2,
        precio: lote.precioReferencial,
        manzanaId: lote.manzanaId,
        codigoManzana: lote.manzana?.codigo || ''
      };

      // 1. Cargamos la reserva, el lote, el precio y bloqueamos
      this.form.patchValue({
        reservaId: reserva.id,
        loteId: lote.id,
        moneda: reserva.moneda || 'USD',
        montoTotal: lote.precioReferencial,
        cuotaInicial: reserva.montoReserva || 0
      });

      // Bloqueamos la moneda según Regla 5
      this.form.get('moneda')?.disable();
      // YA NO BLOQUEAMOS EL LOTE:
      // this.form.get('loteId')?.disable();
    }

    // 2. Cargamos al cliente de la reserva como Titular Principal
    if (cliente) {
      const propietarioTitular: CreateVentaPropietarioDto = {
        clienteId: cliente.id,
        rol: RolPropietario.TITULAR
      };

      this.form.patchValue({
        propietarios: [propietarioTitular]
      });
    }

    // 3. Forzar actualización de validez
    this.form.get('loteId')?.updateValueAndValidity();
    this.form.get('propietarios')?.updateValueAndValidity();

    this.cdr.markForCheck();
  }

  onReservaCleared(): void {
    // Si se limpia la reserva, desbloqueamos el lote
    this.currentReservedLote = null;
    this.reservaLabel = '';
    this.form.get('loteId')?.enable();
    this.form.get('moneda')?.enable();
    this.reservaId.setValue(null);
  }
}
