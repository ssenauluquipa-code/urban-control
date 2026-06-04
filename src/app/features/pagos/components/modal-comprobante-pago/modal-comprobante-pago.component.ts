import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationFinancialConfigService } from 'src/app/core/services/configuracion/organization-financial-config.service';
import { OrganizationService } from 'src/app/core/services/configuracion/organization.service';
import { ModalContainerComponent } from 'src/app/shared/components/organisms/modal-container/modal-container.component';

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
}

@Component({
  selector: 'app-modal-comprobante-pago',
  standalone: true,
  imports: [ModalContainerComponent, CommonModule],
  templateUrl: './modal-comprobante-pago.component.html',
  styleUrl: './modal-comprobante-pago.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ModalComprobantePagoComponent implements OnInit {
  // Inyecciones nativas de Angular
  public activeModal = inject(NgbActiveModal);
  private financialConfig = inject(OrganizationFinancialConfigService);
  private organizationService = inject(OrganizationService);
  // INPUT: Recibe los datos unificados desde el register-pagos
  @Input() datosRecibo!: IReciboPagoData;

  // Propiedades dinámicas de la empresa
  public empresaNombre: string = 'TU FUTURO BIENES & RAÍCES';
  public empresaLogo: string = '';
  public empresaDireccion: string = '';
  public empresaTelefono: string = '';

  ngOnInit(): void {
    // Aquí puedes cargar datos extras desde tu servicio de Organización si lo necesitas
    // 🎯 Cargamos los datos reales del backend del endpoint /api/v1/organization
    this.organizationService.getEmpresa().subscribe({
      next: (empresa) => {
        if (empresa) {
          this.empresaNombre = empresa.name;
          this.empresaLogo = empresa.logoUrl; // URL directa de Supabase
          this.empresaDireccion = empresa.address;
          this.empresaTelefono = empresa.phone;
        }
      },
      error: (err) => {
        console.error('Error al cargar info de la organización en el recibo', err);
        // Fallback por si falla el API externo
        this.empresaLogo = 'assets/images/logo-tu-futuro.png';
      }
    });
  }

  /**
   * Dispara la orden de impresión nativa del navegador.
   * Modifica temporalmente el título del documento para que al guardar como PDF
   * sugiera el nombre del cliente y la fecha.
   */
  imprimirRecibo(): void {
    const originalTitle = document.title;
    
    // Formateamos la fecha (DD-MM-YYYY)
    const fecha = new Date(this.datosRecibo.fechaPago);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const fechaStr = `${dia}-${mes}-${anio}`;

    // Establecemos el título temporal. Este será el nombre del archivo PDF.
    document.title = `Recibo - ${this.datosRecibo.cliente} - ${fechaStr}`;
    
    window.print();
    
    // Restauramos el título original del sistema
    document.title = originalTitle;
  }

  /**
   * Cierra el modal y notifica al componente padre
   */
  cerrarModal(): void {
    this.activeModal.close('CLOSE');
  }

}