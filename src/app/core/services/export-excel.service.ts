import { Injectable } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  private getDeepValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  public exportAsExcel<T extends Record<string, any>>(title: string, columns: ColDef[], data: T[]): void {
    
    // Limpiamos el título para usarlo en nombre de archivo y pestaña
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const sheetName = title.substring(0, 31); // Excel limita nombres de hoja a 31 chars

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // --- 1. ENCABEZADOS DIRECTAMENTE EN LA FILA 1 (Sin filas previas) ---
    const columnasVisibles = columns.filter(col => (col.field || col.valueGetter) && !col.hide);
    const headers = columnasVisibles.map(col => col.headerName || col.field || '');
    const headerRow = worksheet.addRow(headers);

    // Estilo de Encabezado (Mismo diseño corporativo)
    headerRow.eachCell((cell: ExcelJS.Cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Slate-800
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' } // Blanco
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } }
      };
    });
    headerRow.height = 25; // Altura compacta pero legible

    // --- 2. DATOS (Inician en Fila 2) ---
    data.forEach((rowData, index) => {
      const rowValues = columnasVisibles.map(col => {
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
            return rawValue !== undefined && rawValue !== null ? String(rawValue) : '';
          }
        }
        
        return rawValue !== undefined && rawValue !== null ? rawValue : '';
      });

      const dataRow = worksheet.addRow(rowValues);

      // Estilo de Datos (Cebra y bordes)
      dataRow.eachCell((cell: ExcelJS.Cell) => {
        cell.font = { name: 'Segoe UI', size: 10, color: { argb: 'FF334155' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        
        // Fondo cebra (filas pares: 2, 4, 6...)
        if (index % 2 !== 0) { 
          // Nota: index 0 es la primera fila de datos (Fila 2 de Excel), que es par en índice 0 pero impar en Excel.
          // Para Excel: Fila 2 es par, Fila 3 es impar.
          // Aplicamos color a filas pares de datos (índice impar en el array de datos si usamos lógica visual simple, 
          // o simplemente alternamos. Aquí alternamos basado en el índice del array 'data').
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' }
          };
        }
      });
      dataRow.height = 20;
    });

    // --- 3. AUTO-FIT COLUMNS ---
    worksheet.columns.forEach((column: Partial<ExcelJS.Column>) => {
      let maxColumnLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell: ExcelJS.Cell, rowNumber: number) => {
        const cellValue = cell.value ? String(cell.value) : '';
        if (cellValue.length > maxColumnLength) {
          maxColumnLength = cellValue.length;
        }
      });
      column.width = maxColumnLength < 12 ? 12 : maxColumnLength + 4;
    });

    // --- 4. GUARDAR CON FECHA EN EL NOMBRE ---
    // Formato fecha: YYYY-MM-DD_HH-mm (Ej: 2026-06-03_14-30)
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // 2026-06-03
    const timeStr = now.toTimeString().slice(0, 5).replace(':', '-'); // 14-30

    const fileName = `${sanitizedTitle}_${dateStr}_${timeStr}.xlsx`;

    workbook.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.sheet' });
      saveAs(blob, fileName);
    });
  }
}