import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  Input,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { OrganizationFinancialConfigService } from "src/app/core/services/configuracion/organization-financial-config.service";
import { OrganizationService } from "src/app/core/services/configuracion/organization.service";
import { ModalContainerComponent } from "src/app/shared/components/organisms/modal-container/modal-container.component";
import { ReciboPdfService } from "src/app/core/services/recibo-pdf.service";
import { AuthService } from "src/app/core/services/auth.service";

export interface IReciboPagoData {
  codigoRecibo: string;
  moneda: string;
  montoNumerico: number;
  montoEnLetras: string;
  fechaPago: Date;
  cliente: string;
  concepto: string;
  aCuenta: number;
  saldo: number;
  total: number;
  metodoPago: string;
  nombreEmisor?: string;

  empresaNombre?: string;
  empresaLogo?: string;
  empresaDireccion?: string;
  empresaTelefono?: string;
  esReimpresion?: boolean;
}

@Component({
  selector: "app-modal-comprobante-pago",
  standalone: true,
  imports: [ModalContainerComponent, CommonModule],
  templateUrl: "./modal-comprobante-pago.component.html",
  styleUrl: "./modal-comprobante-pago.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ModalComprobantePagoComponent implements OnInit {
  public activeModal = inject(NgbActiveModal);
  private financialConfig = inject(OrganizationFinancialConfigService);
  private organizationService = inject(OrganizationService);
  private reciboPdfService = inject(ReciboPdfService);
  private authService = inject(AuthService);

  @Input() datosRecibo!: IReciboPagoData;

  public empresaNombre = "TU FUTURO BIENES & RAÍCES";
  public empresaLogo = "";
  public empresaDireccion = "";
  public empresaTelefono = "";
  public nombreEmisor = "";

  ngOnInit(): void {
    const usuarioActual = this.authService.currentUser();
    if (usuarioActual?.name) {
      this.nombreEmisor = usuarioActual.name;
    } else if (this.datosRecibo?.nombreEmisor) {
      this.nombreEmisor = this.datosRecibo.nombreEmisor;
    }

    this.organizationService.getEmpresa().subscribe({
      next: (empresa) => {
        if (empresa) {
          this.empresaNombre = empresa.name;
          this.empresaLogo = empresa.logoUrl;
          this.empresaDireccion = empresa.address;
          this.empresaTelefono = empresa.phone;
        }
      },
      error: (err) => {
        console.error(
          "Error al cargar info de la organización en el recibo",
          err,
        );
        this.empresaLogo = "assets/images/logo-tu-futuro.png";
      },
    });
  }

  async imprimirRecibo(): Promise<void> {
    let logoBase64: string | undefined;

    if (this.empresaLogo) {
      try {
        logoBase64 = await this.convertUrlToBase64(this.empresaLogo);
        console.log("Logo convertido a Base64 para Impresión de PDF");
      } catch (error) {
        console.error("Error cargando logo para PDF (CORS o red)", error);
      }
    }
    const datosCompletos: IReciboPagoData = {
      ...this.datosRecibo,
      empresaNombre: this.empresaNombre,
      empresaLogo: logoBase64,
      empresaDireccion: this.empresaDireccion,
      empresaTelefono: this.empresaTelefono,
    };

    try {
      // Pasamos 'true' para indicar que queremos IMPRIMIR (abrir pestaña nueva)
      this.reciboPdfService.generarReciboIngreso(datosCompletos, "print");
    } catch (e) {
      console.error("Error abriendo el visor de impresión PDF:", e);
    }
  }

  async descargarPDF(): Promise<void> {
    let logoBase64: string | undefined;

    if (this.empresaLogo) {
      try {
        logoBase64 = await this.convertUrlToBase64(this.empresaLogo);
        console.log("Logo convertido a Base64 para PDF");
      } catch (error) {
        console.error("Error cargando logo para PDF (CORS o red)", error);
      }
    }

    const datosCompletos: IReciboPagoData = {
      ...this.datosRecibo,
      empresaNombre: this.empresaNombre,
      empresaLogo: logoBase64,
      empresaDireccion: this.empresaDireccion,
      empresaTelefono: this.empresaTelefono,
    };

    try {
      this.reciboPdfService.generarReciboIngreso(datosCompletos, "download");
    } catch (e) {
      console.error("Error generando PDF:", e);
    }
  }

  private convertUrlToBase64(url: string): Promise<string> {
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      });
  }

  getNombreMes(fecha: Date): string {
    const meses = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ];
    return meses[new Date(fecha).getMonth()];
  }

  getNombreMoneda(moneda: string): string {
    const monedas: Record<string, string> = {
      BS: "Bolivianos",
      BOB: "Bolivianos",
      USD: "Dólares",
      US$: "Dólares",
    };
    return monedas[moneda?.toUpperCase()] || moneda;
  }

  cerrarModal(): void {
    this.activeModal.close("CLOSE");
  }
}
