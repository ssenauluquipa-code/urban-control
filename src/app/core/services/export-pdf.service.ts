import { Injectable, inject } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { OrganizationService } from 'src/app/core/services/configuracion/organization.service';

const fonts = pdfFonts as any;
(pdfMake as any).vfs = fonts?.pdfMake?.vfs || fonts?.vfs || (globalThis as any).pdfMake?.vfs;

@Injectable({
  providedIn: 'root'
})
export class ExportPdfService {
  private organizationService = inject(OrganizationService);

  private empresaNombre = "TU FUTURO BIENES & RAÍCES";
  private empresaLogoUrl = "";
  private empresaLogoBase64 = "";
  private empresaDireccion = "";
  private empresaTelefono = "";

  constructor() {
    this.organizationService.getEmpresa().subscribe({
      next: (empresa) => {
        if (empresa) {
          this.empresaNombre = empresa.name;
          this.empresaLogoUrl = empresa.logoUrl;
          this.empresaDireccion = empresa.address;
          this.empresaTelefono = empresa.phone;
          if (empresa.logoUrl) {
            this.convertUrlToBase64(empresa.logoUrl).then(base64 => {
              this.empresaLogoBase64 = base64;
            }).catch(err => {
              console.warn("Error al convertir logo de la empresa a base64", err);
            });
          }
        }
      },
      error: () => {
        this.empresaLogoUrl = "assets/images/logo-tu-futuro.png";
        this.convertUrlToBase64(this.empresaLogoUrl).then(base64 => {
          this.empresaLogoBase64 = base64;
        }).catch(() => {});
      }
    });
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

  private getDeepValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  public exportAsPdf<T extends Record<string, any>>(title: string, columns: ColDef[], data: T[]): void {
    
    // Aseguramos que el título exista
    const tituloSeguro = title && title.trim() !== '' ? title : 'REPORTE GENERADO';

    const columnasVisibles = columns.filter(col => (col.field || col.valueGetter) && col.headerName && !col.hide);
    
    // --- TRUCO CLAVE: Definimos el color de fondo DIRECTAMENTE en el objeto de la celda ---
    const headersTable = columnasVisibles.map(col => ({ 
      text: col.headerName || '', 
      style: 'tableHeader',
      fillColor: '#1e293b',  // <--- Forzamos el fondo Azul Oscuro aquí
      color: '#ffffff'       // <--- Forzamos la letra Blanca aquí también
    }));

    const cantidadColumnas = columnasVisibles.length;
    // Si hay 8 o menos columnas -> vertical (portrait)
    // Si hay más de 8 columnas -> horizontal (landscape)
    const orientacionPagina = cantidadColumnas > 8 ? 'landscape' : 'portrait';

    // Ajustamos dinámicamente el tamaño de la fuente para que entren más columnas
    let fontSizeHeader = 10;
    let fontSizeBody = 9;

    if (cantidadColumnas > 8 && cantidadColumnas <= 11) {
      fontSizeHeader = 9;
      fontSizeBody = 8;
    } else if (cantidadColumnas > 11) {
      fontSizeHeader = 8;
      fontSizeBody = 7;
    }

    const rowsTable = data.map(rowData => {
      return columnasVisibles.map(col => {
        let rawValue = undefined;

        if (col.valueGetter && typeof col.valueGetter === 'function') {
          try {
            rawValue = col.valueGetter({
              data: rowData,
              node: null,
              colDef: col,
              column: null,
              api: null,
              columnApi: null,
              context: null,
              getValue: (field: string) => this.getDeepValue(rowData, field)
            } as any);
          } catch (e) {
            console.warn('Error en valueGetter', e);
          }
        }

        if ((rawValue === undefined || rawValue === null) && col.field) {
          rawValue = this.getDeepValue(rowData, col.field);
        }
        
        if (col.valueFormatter && typeof col.valueFormatter === 'function') {
          try {
            return col.valueFormatter({
              value: rawValue,
              data: rowData,
              node: null,
              colDef: col,
              column: null,
              api: null,
              columnApi: null,
              context: null
            } as any);
          } catch (e) {
            console.warn('Error en valueFormatter', e);
            return rawValue !== undefined && rawValue !== null ? String(rawValue) : '';
          }
        }
        
        return rawValue !== undefined && rawValue !== null ? String(rawValue) : '';
      });
    });

    const bodyTable = [headersTable, ...rowsTable];
    
    // Calculamos los anchos de las columnas dinámicamente:
    // - Usamos 'auto' para columnas con datos cortos (fechas, códigos, montos, métodos, estados, etc.) para que se encojan.
    // - Usamos '*' para columnas con textos largos (observaciones, clientes, etc.) o columnas con 'flex' configurado.
    const widthsTable = columnasVisibles.map(col => {
      if (col.flex && col.flex > 0) {
        return '*';
      }
      const fieldLower = String(col.field || '').toLowerCase();
      const headerLower = String(col.headerName || '').toLowerCase();
      if (
        fieldLower.includes('observacion') || 
        fieldLower.includes('descripcion') || 
        fieldLower.includes('cliente') || 
        fieldLower.includes('propietario') ||
        headerLower.includes('observacion') ||
        headerLower.includes('descripción') ||
        headerLower.includes('cliente') ||
        headerLower.includes('propietario')
      ) {
        return '*';
      }
      return 'auto';
    });

    // Construimos la cabecera con el logo, dirección, teléfono y título del reporte
    const headerColumns = [];

    // Lado Izquierdo: Datos de la Empresa
    const companyStack = [];
    if (this.empresaLogoBase64) {
      companyStack.push({
        image: this.empresaLogoBase64,
        width: 100, // Tamaño mediano
        margin: [0, 0, 0, 5]
      });
    } else {
      companyStack.push({
        text: this.empresaNombre,
        fontSize: 11,
        bold: true,
        color: '#0f172a',
        margin: [0, 0, 0, 2]
      });
    }

    if (this.empresaDireccion) {
      companyStack.push({
        text: this.empresaDireccion,
        fontSize: 8,
        color: '#475569',
        margin: [0, 0, 0, 1]
      });
    }
    
    if (this.empresaTelefono) {
      companyStack.push({
        text: `Cel/Tel: ${this.empresaTelefono}`,
        fontSize: 8,
        bold: true,
        color: '#475569'
      });
    }

    headerColumns.push({
      width: '30%',
      stack: companyStack,
      alignment: 'left'
    });

    // Centro: Título del Reporte
    headerColumns.push({
      width: '40%',
      stack: [
        { text: tituloSeguro, fontSize: 14, bold: true, color: '#0f172a', alignment: 'center', margin: [0, 15, 0, 0] }
      ]
    });

    // Lado Derecho: Fecha de Generación
    headerColumns.push({
      width: '30%',
      stack: [
        { text: `Fecha de generación:\n${new Date().toLocaleString()}`, fontSize: 8.5, color: '#64748b', alignment: 'right', margin: [0, 15, 0, 0] }
      ]
    });

    const docDefinition: any = {
      pageSize: 'LETTER',
      pageOrientation: orientacionPagina,
      pageMargins: [20, 30, 20, 40],
      content: [
        { columns: headerColumns, margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: widthsTable,
            body: bodyTable
          },
          // Layout simplificado: Solo maneja bordes y cebra para el CUERPO
          // (El fondo de la cabecera ya está forzado en la celda)
          layout: {
            hLineColor: () => '#cbd5e1',
            vLineColor: () => '#cbd5e1',
            paddingLeft: () => 5,
            paddingRight: () => 5,
            paddingTop: () => 6,
            paddingBottom: () => 6,
            // Cebra para el cuerpo (filas 1 en adelante)
            fillColor: (rowIndex: number) => {
              if (rowIndex === 0) return null; // No tocamos la fila 0 (cabecera), ya tiene su color
              return rowIndex % 2 === 0 ? '#f8fafc' : null; 
            }
          }
        }
      ],
      styles: {
        // Estilo base para la cabecera (aunque sobreescribimos colores en la celda, esto mantiene alineación y fuente)
        tableHeader: {
          fontSize: fontSizeHeader,
          bold: true,
          alignment: 'center'
        }
      },
      defaultStyle: {
        fontSize: fontSizeBody,
        color: '#334155'
      }
    };

    const fileName = `${tituloSeguro.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
  }
}