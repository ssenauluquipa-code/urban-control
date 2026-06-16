/**
 * Convierte un número a su representación en letras en español.
 * Usado principalmente para generar recibos de pago.
 *
 * @param numero - El número a convertir (puede incluir decimales)
 * @param moneda - La moneda (BS, USD, etc.)
 * @returns El número en letras con formato de moneda
 *
 * @example
 * convertirNumeroALetras(1500.50, 'BS')
 * // Returns: "UN MIL QUINIENTOS 50/100 BOLIVIANOS"
 *
 * convertirNumeroALetras(250, 'USD')
 * // Returns: "DOSCIENTOS CINCUENTA 00/100 DÓLARES"
 */
export function convertirNumeroALetras(numero: number, moneda = "BS"): string {
  if (isNaN(numero)) {
    return "CERO 00/100";
  }

  // Separar enteros y decimales
  const entero = Math.floor(numero);
  const decimales = Math.round((numero - entero) * 100);
  const decimalStr = decimales.toString().padStart(2, "0");

  // Convertir parte entera a letras
  const letrasEntero = numeroATexto(entero);

  // Determinar nombre de la moneda
  const nombreMoneda = obtenerNombreMoneda(moneda, entero);

  return `${letrasEntero} ${decimalStr}/100 ${nombreMoneda}`;
}

/**
 * Convierte un número entero a texto en español.
 */
function numeroATexto(numero: number): string {
  if (numero === 0) return "CERO";
  if (numero < 0) return "MENOS " + numeroATexto(-numero);

  const unidades = [
    "",
    "UNO",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
    "DIEZ",
    "ONCE",
    "DOCE",
    "TRECE",
    "CATORCE",
    "QUINCE",
    "DIECISEIS",
    "DIECISIETE",
    "DIECIOCHO",
    "DIECINUEVE",
  ];

  const decenas = [
    "",
    "",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];

  const centenas = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];

  if (numero < 20) {
    return unidades[numero];
  }

  if (numero < 100) {
    const unidad = numero % 10;
    const decena = Math.floor(numero / 10);
    if (numero < 30) {
      return unidad === 0 ? "VEINTE" : `VEINTI${unidades[unidad]}`;
    }
    return unidad === 0
      ? decenas[decena]
      : `${decenas[decena]} Y ${unidades[unidad]}`;
  }

  if (numero < 1000) {
    const centena = Math.floor(numero / 100);
    const resto = numero % 100;
    if (numero === 100) return "CIEN";
    return resto === 0
      ? centenas[centena]
      : `${centenas[centena]} ${numeroATexto(resto)}`;
  }

  if (numero < 1000000) {
    const miles = Math.floor(numero / 1000);
    const resto = numero % 1000;
    const textoMiles = miles === 1 ? "UN MIL" : `${numeroATexto(miles)} MIL`;
    return resto === 0 ? textoMiles : `${textoMiles} ${numeroATexto(resto)}`;
  }

  if (numero < 1000000000) {
    const millones = Math.floor(numero / 1000000);
    const resto = numero % 1000000;
    const textoMillones =
      millones === 1 ? "UN MILLÓN" : `${numeroATexto(millones)} MILLONES`;
    return resto === 0
      ? textoMillones
      : `${textoMillones} ${numeroATexto(resto)}`;
  }

  // Números mayores a mil millones
  const milMillones = Math.floor(numero / 1000000000);
  const resto = numero % 1000000000;
  const textoMilMillones =
    milMillones === 1
      ? "UN MIL MILLONES"
      : `${numeroATexto(milMillones)} MIL MILLONES`;
  return resto === 0
    ? textoMilMillones
    : `${textoMilMillones} ${numeroATexto(resto)}`;
}

/**
 * Obtiene el nombre completo de la moneda en plural o singular.
 */
function obtenerNombreMoneda(codigo: string, cantidad: number): string {
  const plural = cantidad !== 1;

  const monedas: Record<string, { singular: string; plural: string }> = {
    BS: { singular: "BOLIVIANO", plural: "BOLIVIANOS" },
    BOB: { singular: "BOLIVIANO", plural: "BOLIVIANOS" },
    USD: { singular: "DÓLAR", plural: "DÓLARES" },
    US$: { singular: "DÓLAR", plural: "DÓLARES" },
    EUR: { singular: "EURO", plural: "EUROS" },
    PEN: { singular: "SOL", plural: "SOLES" },
    ARS: { singular: "PESO", plural: "PESOS" },
  };

  const moneda = monedas[codigo.toUpperCase()] || {
    singular: codigo,
    plural: codigo,
  };
  return plural ? moneda.plural : moneda.singular;
}
