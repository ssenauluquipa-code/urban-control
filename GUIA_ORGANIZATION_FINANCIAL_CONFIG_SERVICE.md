# Guía: configuración financiera de empresa y cálculo monetario

## Objetivo

Se crearon dos servicios pequeños y separados para no mezclar responsabilidades:

1. leer configuración financiera global de la empresa
2. hacer cálculos monetarios simples para venta

La idea es que esta base sirva para:

- `reserva`
- `venta`
- luego `pagos`

sin sobrecargar un solo servicio.

---

## Servicio 1: `OrganizationFinancialConfigService`

### Archivo

- `src/app/core/services/configuracion/organization-financial-config.service.ts`

### ¿Para qué sirve?

Este servicio centraliza la lectura de la configuración financiera básica de la empresa.

Por ahora se enfoca solo en estos campos:

- `currency`
- `tipoDeCambio`
- `diasVencimientoReserva`

La idea es evitar que cada componente tenga que leer directamente `OrganizationService` y hacer sus propios `map()` manuales.

### Qué expone

- `getFinancialConfig()`
- `getBaseCurrency()`
- `getExchangeRate()`
- `getReservationDueDays()`

### Qué NO hace

Este servicio **no**:

- convierte monedas
- calcula saldo restante
- calcula equivalencias
- reemplaza la lógica de negocio de `reserva` o `venta`

Solo expone la configuración financiera de empresa.

---

## Servicio 2: `CurrencyCalculationService`

### Archivo

- `src/app/core/services/finance/currency-calculation.service.ts`

### ¿Para qué sirve?

Este servicio se creó para cálculos monetarios pequeños y reutilizables.

Por ahora está pensado principalmente para `venta`, porque `CreateVentaDto` ya tiene:

- `montoTotal`
- `cuotaInicial`
- `moneda`

Con eso sí ya se puede calcular saldo y equivalencias.

### Qué expone

- `roundCurrency()`
- `convertAmount()`
- `calculateRemainingBalance()`
- `calculateVentaSummary()`

### Qué hace cada método

#### `roundCurrency()`
Redondea montos a 2 decimales por defecto.

#### `convertAmount()`
Convierte montos entre:

- `BS`
- `USD`

usando el tipo de cambio recibido.

#### `calculateRemainingBalance()`
Calcula:

- `montoTotal - cuotaInicial`

Si el resultado da negativo, retorna `0`.

#### `calculateVentaSummary()`
Devuelve un resumen completo para venta con:

- `montoTotal`
- `cuotaInicial`
- `saldoPendiente`
- `monedaOperacion`
- `monedaBase`
- `tipoCambio`
- `montoTotalMonedaBase`
- `cuotaInicialMonedaBase`
- `saldoPendienteMonedaBase`

---

## Cómo se complementan

### `OrganizationFinancialConfigService`
Te da:

- moneda base de empresa
- tipo de cambio actual
- días de vencimiento para reserva

### `CurrencyCalculationService`
Usa esos datos para:

- convertir montos
- sacar saldo pendiente
- mostrar equivalencias en moneda base

---

## Uso recomendado en reserva

Con el DTO actual de reserva:

- `clienteId`
- `loteId`
- `montoReserva`
- `moneda`
- `fechaVencimiento`
- `observaciones`

por ahora conviene usar solo:

- `OrganizationFinancialConfigService`

para obtener:

- tipo de cambio
- moneda base
- días de vencimiento por defecto

Todavía no se hizo un cálculo grande para reserva porque el DTO actual no trae directamente el monto total del lote dentro de la operación.

---

## Uso recomendado en venta

Con `CreateVentaDto` sí ya puedes usar ambos servicios juntos.

Ejemplo conceptual:

- `montoTotal = 50000`
- `cuotaInicial = 5000`
- `moneda = BS`
- `currency empresa = USD`
- `tipoDeCambio = 6.96`

Resultado esperado con `calculateVentaSummary()`:

- saldo pendiente en moneda operación
- equivalente total en moneda base
- equivalente de cuota inicial en moneda base
- equivalente del saldo pendiente en moneda base

---

## Qué se hizo hasta ahora

### Ya creado

1. `OrganizationFinancialConfigService`
2. `CurrencyCalculationService`

### No se hizo todavía

- integración en formularios de reserva
- integración en formularios de venta
- cálculos para pagos
- persistencia del tipo de cambio aplicado por operación

---

## Próximo paso recomendado

Cuando decidas usar esto en formularios, el siguiente paso lógico sería:

1. usar `OrganizationFinancialConfigService` para leer `currency` y `tipoDeCambio`
2. usar `CurrencyCalculationService` para mostrar cálculos automáticos en `venta`
3. después ampliar la lógica para `reserva` o `pagos` según necesidad real
