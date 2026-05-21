import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnDestroy,
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
import { IReserva, Moneda } from "src/app/core/models/reserva.model";
import { CurrencyCalculationService } from "src/app/core/services/finance/currency-calculation.service";
import { OrganizationFinancialConfigService } from "src/app/core/services/configuracion/organization-financial-config.service";
import { Subject } from "rxjs";
import { filter, take, takeUntil } from "rxjs/operators";
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
import { InputCurrencyComponent } from "src/app/shared/components/atoms/input-currency/input-currency.component";
import { CardContainerComponent } from "src/app/shared/components/atoms/card-container/card-container.component";
import { InputSearchReservaComponent } from "../../components/input-search-reserva.component";
import { ReservaService } from "src/app/core/services/reserva.service";
import { ActivatedRoute } from "@angular/router";


/** Vista del formulario de registro de venta (lote, reserva, financiamiento, propietarios). */
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
    InputCurrencyComponent,
    CardContainerComponent,
    InputSearchReservaComponent,
    InputNumberComponent
  ],
  templateUrl: "./register-venta-view.component.html",
  styleUrl: "./register-venta-view.component.scss",
})
export class RegisterVentaViewComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private reservaService = inject(ReservaService);
  private route = inject(ActivatedRoute);
  private currencyCalc = inject(CurrencyCalculationService);
  private financialConfig = inject(OrganizationFinancialConfigService);
  private destroy$ = new Subject<void>();

  @Input() form!: FormGroup;
  @Input() loading = false;
  @Input() monedaBase: Moneda = Moneda.USD;

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
    return this.form.get("moneda") as FormControl<Moneda | null>;
  }
  get tipoCambio() {
    return this.form.get("tipoCambio") as FormControl<number | null>;
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

  /** Saldo a financiar: 0 en contado sin reserva; total − inicial en cuotas o con adelanto. */
  get saldoPendienteValue(): number {
    if (this.isContado && !this.reservaId.value) {
      return 0;
    }
    return this.currencyCalc.calculateRemainingBalance(
      this.montoTotalValue,
      this.cuotaInicialValue,
    );
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
    this.listenLoteClearedWhenReservaLinked();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Si hay reserva vinculada y se quita el lote, limpia el resto de datos de la reserva. */
  private listenLoteClearedWhenReservaLinked(): void {
    this.loteId.valueChanges
      .pipe(
        filter((id) => !id),
        filter(() => !!this.reservaId.value),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.onReservaCleared());
  }

  /** Precarga reserva desde query param ?reservaId=. */
  private checkUrlParams(): void {
    this.route.queryParams.subscribe(params => {
      const reservaId = params['reservaId'];
      if (reservaId) {
        this.onReservaSelected({ id: reservaId });
      }
    });
  }

  /** Sincroniza propietarios cuando cambia el selector de clientes. */
  onClientesChange(event: SelectClienteOutput): void {
    if (Array.isArray(event)) {
      this.form.patchValue({ propietarios: event });
    }
  }

  /** Carga reserva completa y aplica lote, montos y titular al formulario. */
  onReservaSelected(reserva: Partial<IReserva>): void {
    if (!reserva) return;

    if (!reserva.lote && (reserva.reservaId || reserva.id)) {
      const id = (reserva.reservaId || reserva.id) as string;
      this.reservaService.getReservaById(id).subscribe((fullReserva) => {
        this.applyReservaData({
          ...fullReserva,
          tipoCambio: fullReserva.tipoCambio ?? reserva.tipoCambio,
          precioLote:
            fullReserva.lote?.precioReferencial ?? reserva.precioLote,
        } as IReserva);
      });
    } else {
      this.applyReservaData(reserva as IReserva);
    }
  }

  /** Rellena lote, moneda, monto convertido, adelanto y titular desde la reserva. */
  private applyReservaData(reserva: IReserva): void {
    const lote = reserva.lote;
    const cliente = reserva.cliente || { id: reserva.clienteId };
    const loteId = lote?.id ?? reserva.loteId;
    const precioLote = lote?.precioReferencial ?? reserva.precioLote ?? 0;
    const monedaOperacion = reserva.moneda;
    const tipoCambio = Number(reserva.tipoCambio ?? this.tipoCambio.value ?? 0);

    const mza = reserva.manzana || lote?.manzana?.codigo || "";
    const nroLote = reserva.numeroLote || lote?.numero || "";
    this.reservaLabel = `#${reserva.codigoReserva} - Mza. ${mza} Lote ${nroLote}`;

    if (loteId) {
      this.currentReservedLote = {
        id: loteId,
        descripcion: `Lote ${nroLote} - Mza. ${mza}`,
        nroLote: Number(nroLote) || lote?.numero || 0,
        areaM2: lote?.areaM2 ?? reserva.areaLote ?? 0,
        precio: precioLote,
        manzanaId: lote?.manzanaId ?? "",
        codigoManzana: mza,
      };

      const montoTotal = this.currencyCalc.convertAmount(
        precioLote,
        this.monedaBase,
        monedaOperacion,
        tipoCambio,
      );

      this.form.patchValue({
        reservaId: reserva.reservaId || reserva.id,
        loteId,
        moneda: monedaOperacion,
        tipoCambio,
        montoTotal,
        cuotaInicial: reserva.montoReserva || 0,
      });

      this.form.get("moneda")?.disable({ emitEvent: false });
      this.form.get("tipoCambio")?.disable({ emitEvent: false });
    }

    if (cliente?.id) {
      const propietarioTitular: CreateVentaPropietarioDto = {
        clienteId: cliente.id,
        rol: RolPropietario.TITULAR,
      };
      this.form.patchValue({ propietarios: [propietarioTitular] });
    }

    this.form.get("loteId")?.updateValueAndValidity();
    this.form.get("propietarios")?.updateValueAndValidity();
    this.form.updateValueAndValidity({ emitEvent: false });
    this.cdr.markForCheck();
  }

  /** Limpia reserva, lote, propietarios y restaura config financiera de empresa. */
  onReservaCleared(): void {
    this.currentReservedLote = null;
    this.reservaLabel = "";
    this.reservaId.setValue(null);
    this.loteId.setValue(null);

    this.propietarios.setValue([]);
    this.form.get("propietarios")?.updateValueAndValidity();
    this.form.get("loteId")?.updateValueAndValidity();

    this.form.get("moneda")?.enable({ emitEvent: false });
    this.form.get("tipoCambio")?.enable({ emitEvent: false });

    this.financialConfig
      .getFinancialConfig()
      .pipe(take(1))
      .subscribe((config) => {
        const moneda = config.currency === Moneda.USD ? Moneda.USD : Moneda.BS;
        this.form.patchValue({
          moneda,
          tipoCambio: config.exchangeRate,
          cuotaInicial: 0,
          montoTotal: 0,
        });
        this.form.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });
  }
}
