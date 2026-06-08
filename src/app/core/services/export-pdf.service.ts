import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const fonts = pdfFonts as any;
(pdfMake as any).vfs = fonts?.pdfMake?.vfs || fonts?.vfs || (globalThis as any).pdfMake?.vfs;

@Injectable({
  providedIn: 'root'
})
export class ExportPdfService {

  private getDeepValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  public exportAsPdf<T extends Record<string, any>>(title: string, columns: ColDef[], data: T[]): void {
    
    // Aseguramos que el título exista
    const tituloSeguro = title && title.trim() !== '' ? title : 'REPORTE GENERADO';

    const columnasVisibles = columns.filter(col => col.field && col.headerName && !col.hide);
    
    // --- TRUCO CLAVE: Definimos el color de fondo DIRECTAMENTE en el objeto de la celda ---
    const headersTable = columnasVisibles.map(col => ({ 
      text: col.headerName || '', 
      style: 'tableHeader',
      fillColor: '#1e293b',  // <--- Forzamos el fondo Azul Oscuro aquí
      color: '#ffffff'       // <--- Forzamos la letra Blanca aquí también
    }));

    const cantidadColumnas = columnasVisibles.length;
    const orientacionPagina = cantidadColumnas > 7 ? 'landscape' : 'portrait';

    const rowsTable = data.map(rowData => {
      return columnasVisibles.map(col => {
        const rawValue = this.getDeepValue(rowData, col.field!);
        
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
    const widthsTable = columnasVisibles.map(() => '*');

    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: orientacionPagina,
      pageMargins: [20, 40, 20, 40],
      content: [
        // Título principal (Letra Oscura sobre papel blanco)
        { text: tituloSeguro, style: 'title' },
        
        { text: `Fecha de generación: ${new Date().toLocaleString()}`, style: 'subtitle' },
        
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
        title: {
          fontSize: 18,
          bold: true,
          color: '#0f172a', // Azul oscuro para el título del documento
          margin: [0, 0, 0, 15],
          alignment: 'center'
        },
        subtitle: {
          fontSize: 9,
          color: '#64748b',
          margin: [0, 0, 0, 15],
          alignment: 'right'
        },
        // Estilo base para la cabecera (aunque sobreescribimos colores en la celda, esto mantiene alineación y fuente)
        tableHeader: {
          fontSize: 10,
          bold: true,
          alignment: 'center'
        }
      },
      defaultStyle: {
        fontSize: 9,
        color: '#334155'
      }
    };

    const fileName = `${tituloSeguro.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${new Date().getTime()}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
  }
}