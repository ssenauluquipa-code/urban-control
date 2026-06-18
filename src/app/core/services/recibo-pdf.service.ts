/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from "@angular/core";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { IReciboPagoData } from "src/app/features/pagos/components/modal-comprobante-pago/modal-comprobante-pago.component";

const fonts = pdfFonts as any;
(pdfMake as any).vfs =
  fonts?.pdfMake?.vfs || fonts?.vfs || (globalThis as any).pdfMake?.vfs;

@Injectable({
  providedIn: "root",
})
export class ReciboPdfService {
  generarReciboIngreso(
    datos: IReciboPagoData,
    accion: "download" | "print" = "download",
  ): void {
    const aCuentaBox = {
      width: datos.esReimpresion ? "48%" : "31%",
      table: {
        widths: ["*"],
        body: [
          [
            {
              text: [
                {
                  text: "A cuenta: ",
                  style: "lblCajitaInline",
                },
                {
                  text: `${datos.moneda || "BS"} ${new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2 }).format(datos.aCuenta || 0)}`,
                  style: "valCajitaInline",
                },
              ],
              style: "recuadroMontoInternoFila",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
        vLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.widths.length ? 1.5 : 0,
        hLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.body.length ? 1.5 : 0,
        vLineColor: () => "#0f172a",
        hLineColor: () => "#0f172a",
      },
    };

    const saldoBox = {
      width: "31%",
      table: {
        widths: ["*"],
        body: [
          [
            {
              text: [
                {
                  text: "Saldo: ",
                  style: "lblCajitaInline",
                },
                {
                  text: `${datos.moneda || "BS"} ${new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2 }).format(datos.saldo || 0)}`,
                  style: "valCajitaInline",
                },
              ],
              style: "recuadroMontoInternoFila",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
        vLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.widths.length ? 1.5 : 0,
        hLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.body.length ? 1.5 : 0,
        vLineColor: () => "#0f172a",
        hLineColor: () => "#0f172a",
      },
    };

    const totalBox = {
      width: datos.esReimpresion ? "48%" : "31%",
      table: {
        widths: ["*"],
        body: [
          [
            {
              text: [
                {
                  text: "Total: ",
                  style: "lblCajitaInline",
                },
                {
                  text: `${datos.moneda || "BS"} ${new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2 }).format(datos.total || 0)}`,
                  style: "valCajitaInline",
                },
              ],
              style: "bgTotalBoldFila",
            },
          ],
        ],
      },
      layout: {
        defaultBorder: false,
        vLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.widths.length ? 2 : 0,
        hLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.body.length ? 2 : 0,
        vLineColor: () => "#0f172a",
        hLineColor: () => "#0f172a",
      },
    };

    const columnasTotales = datos.esReimpresion
      ? [aCuentaBox, { width: "4%", text: "" }, totalBox]
      : [
          aCuentaBox,
          { width: "3.5%", text: "" },
          saldoBox,
          { width: "3.5%", text: "" },
          totalBox,
        ];

    const docDefinition: any = {
      pageSize: "LETTER",
      pageMargins: [35, 35, 35, 35],
      defaultStyle: {
        font: "Roboto",
        fontSize: 10,
        color: "#0f172a",
      },
      styles: {
        // === CONTENEDORES Y BORDES (Talonario Tradicional) ===
        bordeExterior: {
          border: [2, 2, 2, 2],
          borderColor: "#334155",
        },
        bordeInterior: {
          border: [1, 1, 1, 1],
          borderColor: "#64748b",
          borderDash: { length: 4, space: 4 },
          padding: [25, 20, 25, 20],
        },

        // === COLUMNA 1: DATOS EMPRESA ===
        empresaDatosContainer: {
          alignment: "center",
        },
        empresaNombre: {
          fontSize: 11,
          bold: true,
          color: "#0f172a",
          margin: [0, 2, 0, 0],
        },
        empresaRubro: {
          fontSize: 8.5,
          bold: true,
          color: "#475569",
          margin: [0, 1, 0, 2],
        },
        empresaDireccion: {
          fontSize: 8,
          color: "#334155",
          lineHeight: 1.2,
        },
        empresaTelefono: {
          fontSize: 8,
          bold: true,
          color: "#334155",
        },

        // === COLUMNA 2: TÍTULO CENTRAL ===
        tituloContainer: {
          alignment: "center",
          margin: [0, 6, 0, 0],
        },
        tituloRecibo: {
          fontSize: 20,
          bold: true,
          color: "#000000",
          letterSpacing: 1.5,
        },
        subtituloRecibo: {
          fontSize: 12,
          bold: true,
          color: "#16a34a",
          margin: [0, -2, 0, 0],
        },

        // === COLUMNA 3: CAJA VALORES CONTROL ===
        valoresControlContainer: {
          alignment: "right",
        },
        montoRecuadroInterno: {
          fontSize: 13,
          bold: true,
          color: "#000000",
          alignment: "right",
        },
        numeroLabel: {
          fontSize: 12,
          bold: true,
          color: "#0f172a",
          margin: [0, 1, 0, 0],
        },
        numeroValor: {
          fontSize: 13,
          bold: true,
          color: "#dc2626",
        },

        // === FILA FECHA SUPERIOR ===
        fechaContainer: {
          margin: [0, 10, 0, 20],
          alignment: "right",
        },
        fechaTexto: {
          fontSize: 11,
          color: "#475569",
        },
        fechaDato: {
          fontSize: 11,
          bold: true,
          color: "#0f172a",
        },

        // === CUERPO / RENGLONES (Estilo Escritura Continuo) ===
        renglonFila: {
          margin: [0, 0, 0, 0],
        },
        labelRenglon: {
          fontSize: 11,
          bold: true,
          color: "#1e293b",
        },
        valorRenglon: {
          fontSize: 11,
          color: "#0f172a",
        },
        lineaPunteadaCanvas: {
          margin: [0, 4, 0, 14],
        },

        // === TOTALES Y CUADROS INFERIORES CORREGIDOS ===
        totalesSectionContainer: {
          margin: [0, 10, 0, 30],
        },
        recuadroMontoInternoFila: {
          border: [1.5, 1.5, 1.5, 1.5],
          borderColor: "#0f172a",
          fillColor: "#f8fafc",
          fontSize: 11,
          color: "#0f172a",
          padding: [8, 5, 8, 5],
        },
        bgTotalBoldFila: {
          border: [2, 2, 2, 2],
          borderColor: "#0f172a",
          fillColor: "#f1f5f9",
          fontSize: 11,
          color: "#0f172a",
          padding: [8, 5, 8, 5],
        },
        lblCajitaInline: {
          bold: true,
          color: "#475569",
        },
        valCajitaInline: {
          bold: true,
          color: "#0f172a",
        },

        // === BLOQUE DE FIRMAS ===
        firmasContainer: {
          margin: [0, 10, 0, 0],
        },
        firmaBox: {
          alignment: "center",
        },
        lineaPunteadaFirma: {
          margin: [0, 0, 0, 6],
        },
        firmaRol: {
          fontSize: 10,
          bold: true,
          color: "#334155",
          letterSpacing: 0.5,
        },
        firmaNombreContainer: {
          margin: [0, 6, 0, 0],
          alignment: "center",
        },
        firmaNombreLabel: {
          fontSize: 10,
          color: "#475569",
        },
        firmaNombreValor: {
          fontSize: 10,
          bold: true,
          color: "#000000",
        },
        firmaPuntos: {
          fontSize: 10,
          color: "#cbd5e1",
        },
      },

      content: [
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  style: "bordeInterior",
                  stack: [
                    // === 1. HEADER TRIPLE FILA ===
                    {
                      columns: [
                        // Columna Empresa (Izquierda)
                        {
                          width: "35%",
                          style: "empresaDatosContainer",
                          stack: [
                            datos.empresaLogo
                              ? {
                                  image: datos.empresaLogo,
                                  width: 110,
                                  alignment: "center",
                                  margin: [0, 0, 0, 5],
                                }
                              : {
                                  text: datos.empresaNombre || "EMPRESA",
                                  style: "empresaNombre",
                                },

                            !datos.empresaLogo
                              ? {
                                  text: "BIENES & RAÍCES",
                                  style: "empresaRubro",
                                }
                              : { text: "", fontSize: 0 },

                            {
                              text:
                                datos.empresaDireccion ||
                                "Av. Circunvalación entre Luis Campero y Timoto Raña\nEdificio rojo",
                              style: "empresaDireccion",
                            },
                            {
                              text: `Cel/Tel: ${datos.empresaTelefono || "68598919"}`,
                              style: "empresaTelefono",
                              margin: [0, 2, 0, 0],
                            },
                          ],
                        },
                        // Columna Título (Centro)
                        {
                          width: "30%",
                          style: "tituloContainer",
                          stack: [
                            { text: "RECIBO", style: "tituloRecibo" },
                            {
                              text: `DE ${datos.concepto ? "INGRESO" : "PAGO"}`,
                              style: "subtituloRecibo",
                            },
                          ],
                        },
                        // Columna Controles (Derecha) - CORREGIDO: "BS" y Monto Juntos en el Recuadro
                        {
                          width: "35%",
                          style: "valoresControlContainer",
                          stack: [
                            {
                              table: {
                                widths: ["*"],
                                body: [
                                  [
                                    {
                                      text: [
                                        {
                                          text: `${datos.moneda || "BS"}.  `,
                                          fontSize: 11,
                                          bold: true,
                                          color: "#475569",
                                        },
                                        {
                                          text: new Intl.NumberFormat("es-BO", {
                                            minimumFractionDigits: 2,
                                          }).format(datos.montoNumerico || 0),
                                        },
                                      ],
                                      style: "montoRecuadroInterno",
                                      padding: [10, 5, 10, 5],
                                    },
                                  ],
                                ],
                              },
                              layout: {
                                defaultBorder: false,
                                vLineWidth: (i: number, node: any) =>
                                  i === 0 || i === node.table.widths.length
                                    ? 2
                                    : 0,
                                hLineWidth: (i: number, node: any) =>
                                  i === 0 || i === node.table.body.length
                                    ? 2
                                    : 0,
                                vLineColor: () => "#0f172a",
                                hLineColor: () => "#0f172a",
                              },
                            },
                            {
                              text: [
                                { text: "N° ", style: "numeroLabel" },
                                {
                                  text: datos.codigoRecibo || "000000",
                                  style: "numeroValor",
                                },
                              ],
                              margin: [0, 10, 4, 0],
                            },
                          ],
                        },
                      ],
                    },

                    // === 2. FILA FECHA SUPERIOR ===
                    {
                      style: "fechaContainer",
                      text: [
                        { text: "Tarija, ", style: "fechaTexto" },
                        {
                          text: `${datos.fechaPago ? new Date(datos.fechaPago).getDate() : new Date().getDate()}`,
                          style: "fechaDato",
                        },
                        { text: " de ", style: "fechaTexto" },
                        {
                          text: `${this.getNombreMes(datos.fechaPago ? new Date(datos.fechaPago) : new Date())}`,
                          style: "fechaDato",
                        },
                        { text: " de ", style: "fechaTexto" },
                        {
                          text: `${datos.fechaPago ? new Date(datos.fechaPago).getFullYear() : new Date().getFullYear()}`,
                          style: "fechaDato",
                        },
                      ],
                    },

                    // === 3. CUERPO DE RENGLONES ===
                    {
                      stack: [
                        // Renglón Recibí de
                        {
                          style: "renglonFila",
                          columns: [
                            {
                              text: "Recibí de:",
                              style: "labelRenglon",
                              width: "auto",
                              margin: [0, 0, 6, 0],
                            },
                            {
                              text: datos.cliente || "",
                              style: "valorRenglon",
                              width: "*",
                            },
                          ],
                        },
                        {
                          style: "lineaPunteadaCanvas",
                          canvas: [
                            {
                              type: "line",
                              x1: 0,
                              y1: 0,
                              x2: 495,
                              y2: 0,
                              lineColor: "#64748b",
                              lineWidth: 0.6,
                              dash: { length: 2, space: 2 },
                            },
                          ],
                        },

                        // Renglón La suma de
                        {
                          style: "renglonFila",
                          columns: [
                            {
                              text: "La suma de:",
                              style: "labelRenglon",
                              width: "auto",
                              margin: [0, 0, 6, 0],
                            },
                            {
                              text: datos.montoEnLetras || "",
                              style: "valorRenglon",
                              width: "*",
                            },
                          ],
                        },
                        {
                          style: "lineaPunteadaCanvas",
                          canvas: [
                            {
                              type: "line",
                              x1: 0,
                              y1: 0,
                              x2: 495,
                              y2: 0,
                              lineColor: "#64748b",
                              lineWidth: 0.6,
                              dash: { length: 2, space: 2 },
                            },
                          ],
                        },

                        // Renglón Por concepto de
                        {
                          style: "renglonFila",
                          columns: [
                            {
                              text: "Por concepto de:",
                              style: "labelRenglon",
                              width: "auto",
                              margin: [0, 0, 6, 0],
                            },
                            {
                              text: datos.concepto || "",
                              style: "valorRenglon",
                              width: "*",
                            },
                          ],
                        },
                        {
                          style: "lineaPunteadaCanvas",
                          canvas: [
                            {
                              type: "line",
                              x1: 0,
                              y1: 0,
                              x2: 495,
                              y2: 0,
                              lineColor: "#64748b",
                              lineWidth: 0.6,
                              dash: { length: 2, space: 2 },
                            },
                          ],
                        },
                      ],
                    },

                    // === 4. FILA DE TOTALES Y CAJAS INFERIORES CORREGIDAS (Etiqueta y Monto en la misma fila) ===
                    {
                      style: "totalesSectionContainer",
                      columns: columnasTotales,
                    },

                    // === 5. SECCIÓN DE FIRMAS ===
                    {
                      columns: [
                        {
                          width: "*",
                          stack: [
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: 0,
                                  y1: 0,
                                  x2: 190,
                                  y2: 0,
                                  lineColor: "#334155",
                                  lineWidth: 0.8,
                                  dash: { length: 3, space: 3 },
                                },
                              ],
                              style: "lineaPunteadaFirma",
                            },
                            { text: "RECIBÍ CONFORME", style: "firmaRol" },
                            {
                              columns: [
                                {
                                  text: "Nombre:",
                                  style: "firmaNombreLabel",
                                  width: "auto",
                                  margin: [0, 0, 3, 0],
                                },
                                {
                                  text: datos.cliente || "",
                                  style: "firmaNombreValor",
                                  width: "*",
                                },
                              ],
                              style: "firmaNombreContainer",
                            },
                          ],
                          style: "firmaBox",
                        },
                        { width: 45, text: "" }, // Separación central de firmas
                        {
                          width: "*",
                          stack: [
                            {
                              canvas: [
                                {
                                  type: "line",
                                  x1: 0,
                                  y1: 0,
                                  x2: 190,
                                  y2: 0,
                                  lineColor: "#334155",
                                  lineWidth: 0.8,
                                  dash: { length: 3, space: 3 },
                                },
                              ],
                              style: "lineaPunteadaFirma",
                            },
                            { text: "ENTREGUÉ CONFORME", style: "firmaRol" },
                            {
                              columns: [
                                {
                                  text: "Nombre:",
                                  style: "firmaNombreLabel",
                                  width: "auto",
                                  margin: [0, 0, 3, 0],
                                },
                                {
                                  text: datos.nombreEmisor || "",
                                  style: "firmaNombreValor",
                                  width: "*",
                                },
                              ],
                              style: "firmaNombreContainer",
                            },
                          ],
                          style: "firmaBox",
                        },
                      ],
                      style: "firmasContainer",
                    },
                  ],
                },
              ],
            ],
          },
          layout: {
            defaultBorder: false,
            vLineWidth: (i: number, node: any) =>
              i === 0 || i === node.table.widths.length ? 1 : 0,
            hLineWidth: (i: number, node: any) =>
              i === 0 || i === node.table.body.length ? 1 : 0,
            vLineColor: () => "#64748b",
            hLineColor: () => "#64748b",
            vLineDash: () => {
              return { length: 4, space: 4 };
            },
            hLineDash: () => {
              return { length: 4, space: 4 };
            },
          },
        },
      ],
      layout: {
        defaultBorder: false,
        vLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.widths.length ? 2 : 0,
        hLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.body.length ? 2 : 0,
        vLineColor: () => "#334155",
        hLineColor: () => "#334155",
      },
    };

    if (accion === "print") {
      pdfMake.createPdf(docDefinition).print();
    } else {
      pdfMake
        .createPdf(docDefinition)
        .download(`Recibo-Ingreso-${datos.codigoRecibo}.pdf`);
    }
  }

  private getNombreMes(fecha: Date): string {
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
    return meses[fecha.getMonth()];
  }
}
