¡Excelente iniciativa! Tener esa documentación ("la fuente de la verdad") dentro de tu proyecto es vital para que cualquier IA (o desarrollador nuevo) entienda el negocio.

No se "instala" como un paquete, sino que se sigue la filosofía **"Docs as Code" (Documentación como Código)**. Lo estándar es crear una carpeta `/docs` en tu proyecto y guardar la información ahí en formato **Markdown (.md)**.

Aquí te explico paso a paso cómo agregar esto y he preparado un resumen ejecutivo basado en tus transcripciones para que el agente IA lo lea fácilmente.

### Paso 1: Estructura de Carpetas

Ve a la raíz de tu proyecto (donde está `package.json`, `angular.json`, etc.) y crea esta estructura:

```text
tu-proyecto/
├── src/
├── docs/
│   └── ventas/
│       ├── 01-reglas-negocio.md          <--- PEGA AQUÍ EL CONTENIDO DE ABAJO
│       ├── 02-casos-de-uso.md
│       └── 03-roles-y-permisos.md
├── package.json
└── ...
```

### Paso 2: Contenido para `docs/ventas/01-reglas-negocio.md`

He procesado todas tus transcripciones y las he convertido en reglas técnicas claras. Copia este contenido en ese archivo.

```markdown
# Reglas de Negocio - Módulo de Ventas

**Fuente:** Reuniones de negocio y pruebas de Postman.
**Última actualización:** 2023-10-27

## 1. Datos Generales y Flujo

- **Endpoint:** `POST /api/v1/ventas`
- **Acción:** Registra venta, genera cuotas (si aplica), convierte reserva (si aplica).
- **Optimización API:** El endpoint de venta ha sido optimizado. La respuesta ya no devuelve el objeto completo creado, solo `{ status, message, data: { id, ... } }`.
  - *Impacto Frontend:* No intentar mapear la respuesta completa al listado. Usar los datos del formulario + el ID retornado.

## 2. Campos Obligatorios y Condicionales

### Base (Siempre Requerido)
- `loteId`: Debe estar activo y disponible.
- `asesorId`: Vinculado a la operación.
- `tipoPago`: `CONTADO` o `CUOTAS`.
- `montoTotal`: Obtenido del precio del lote (Campo Read-Only en UI).
- `cuotaInicial`: Monto entregado al inicio.
- `fechaVenta`: Fecha administrativa (Default: Hoy).
- `propietarios`: Array de clientes (Min 1, Max 3).

### Campos Condicionales (SOLO si tipoPago === 'CUOTAS')
- `frecuenciaPago`: `SEMANAL`, `QUINCENAL`, `MENSUAL`, `BIMESTRAL`, `TRIMESTRAL`.
- `fechaPagoInicial`: Fecha inicio del cronograma.
- `nroCuotas`: Cantidad de cuotas. **Límite de Seguridad: 600** (Para evitar saturar DB).

## 3. Lógica de Calendario (Cronograma)

### Frecuencia SEMANAL
- **Campo Requerido:** `diaSemanaPago` (LUNES a DOMINGO).
- **Lógica:** El sistema buscará el primer día de la semana seleccionado (`diaSemanaPago`) que sea igual o posterior a la `fechaPagoInicial`.

### Frecuencia QUINCENAL
- **Campo Requerido:** `modalidadCalendarioPago`.
  - **Opción A:** `INTERVALO_15_DIAS` (Ej: Empieza día 10, siguiente 25, siguiente 40...).
    - *Campos:* `diaPagoMes1` y `diaPagoMes2` deben ser **NULL**.
  - **Opción B:** `DIAS_FIJOS_MES` (Ej: Pagar el 1 y 15 de cada mes).
    - *Campos Requeridos:* `diaPagoMes1` (1-31) y `diaPagoMes2` (1-31).
    - *Lógica:* Salta entre estos dos días fijos mes a mes.

### Frecuencia MENSUAL / BIMESTRAL / TRIMESTRAL
- No requiere configuración especial de calendario.
- `modalidadCalendarioPago`, `diaSemanaPago`, `diaPagoMes1/2` deben ser **NULL**.
- La lógica es sumar el periodo (30, 60, 90 días) a la `fechaPagoInicial`.

## 4. Manejo de Propietarios (Clientes)
- **Estructura:** Array de objetos `{ clienteId, rol }`.
- **Roles:** `TITULAR` y `COTITULAR`.
- **Validaciones Críticas:**
  1. **Solo 1 Titular:** El array no puede tener más de un objeto con rol `TITULAR`.
  2. **Sin Duplicados:** No se puede registrar el mismo `clienteId` dos veces en la misma venta.
- **UI Sugerida:** Un selector múltiple con un toggle/checkbox para definir cuál es el Titular. Por defecto el primero es Titular.

## 5. Manejo de Reservas (Conversión a Venta)
- Si se envía `reservaId`:
  1. El sistema debe cargar automáticamente el `loteId`, `montoTotal`, `cuotaInicial` (monto de la reserva) y `moneda` desde la reserva.
  2. El campo `moneda` debe estar **BLOQUEADO** (Read-Only) para mantener consistencia.
  3. El cliente de la reserva debe sugerirse como propietario, pero permitirse cambiarlo (casos de venta a hijo/esposa).
- **Efecto Secundario:** La reserva cambia de estado a `CONVERTIDA`. El lote desaparece de la lista de "Lotes Disponibles".

## 6. Seguridad y Roles (Applicable a Frontend)

- **EDITOR:**
  - Puede crear ventas solo si su usuario tiene un `asesorId` vinculado.
  - Si NO tiene `asesorId` -> Bloquear formulario y mostrar mensaje: *"Tu usuario necesita un asesor vinculado para realizar esta operación"*.
  - Si SÍ tiene `asesorId` -> Pre-llenar y bloquear el campo Asesor.
- **ADMIN / SUPER_ADMIN:**
  - Acceso completo, pueden seleccionar cualquier asesor.
```

---

### Paso 3: Cómo usar esto con tu Agente IA

Ahora que tienes ese archivo, así es como te ayuda:

1.  **Contexto para el Agente:** La mayoría de las IAs (como GitHub Copilot, Cursor o ChatGPT con repositorio conectado) escanean los archivos `.md` en la carpeta `/docs`. Si le pides al agente: *"Revisa el componente `RegisterVentasComponent` y verifica si cumple las reglas de negocio en `/docs/ventas/01-reglas-negocio.md`"*, el agente hará una comparación técnica precisa.

2.  **Auditoría Manual (Checklist):** Basándonos en tus transcripciones, aquí hay una lista de cosas que debes verificar en el código que ya hicimos:

#### ✅ Lo que SÍ estamos respetando (según tu código anterior):
*   [x] **Límite de 600 cuotas:** Tienes `Validators.max(600)` en el TS.
*   [x] **Roles de Editor:** Tienes la lógica `checkPermissions` que bloquea si no hay `asesorId`.
*   [x] **Visibilidad Condicional:** Usamos `@if (tipoPago === 'CUOTAS')` para ocultar campos de cuotas cuando es CONTADO.
*   [x] **Lógica Quincenal:** Tienes la lógica de `INTERVALO_15_DIAS` vs `DIAS_FIJOS_MES` en el HTML y TS.

#### ⚠️ Posibles Ajustes necesarios (Puntos detectados en las transcripciones):

1.  **Máximo de Propietarios:**
    *   *Transcripción:* "máximo item 3... puedo ser más de 3 es un array... límite a 3 en UI".
    *   *Tu Código Actual:* En el HTML tienes `[maxSelection]="5"`.
    *   *Acción:* Cambia a `[maxSelection]="3"` en el componente `app-select-clientes` para ser más estricto como sugirió la reunión.

2.  **Validación de "Solo 1 Titular":**
    *   *Transcripción:* "Solamente uno debe tener un rol titular... eso con un Check tal vez lo podrías modificar".
    *   *Tu Código Actual:* Usas `app-select-clientes`. Depende de si ese componente interno ya valida que solo uno sea titular. Si el componente permite marcar a varios como titulares, tu frontend enviará datos inválidos y el backend rechazará (409).
    *   *Acción:* Asegúrate de que el componente `app-select-clientes` tenga una lógica que, si marco a uno como Titular, desmarque a los demás automáticamente.

3.  **Bloqueo de Moneda con Reserva:**
    *   *Transcripción:* "si es que viene de una reserva, este campo debería estar bloqueado".
    *   *Tu Código Actual:* En el HTML sugerido puse `[disabled]="!!ventaForm.controls.reservaId.value"`.
    *   *Acción:* Verifica que esto funcione correctamente al seleccionar una reserva.

4.  **Optimización de Respuesta API:**
    *   *Transcripción:* "No te confíes en esta respuesta... va a cambiar... solo necesitas el ID".
    *   *Tu Código Actual:* En `handleSave`, haces `console.log("Venta Exitosa")` pero no estás usando el ID retornado para, por ejemplo, redirigir al detalle de la venta.
    *   *Acción:* En la suscripción del servicio, captura el ID de la respuesta y haz un `this.router.navigate(['/ventas', response.id])`.

### Conclusión
Agrega el archivo markdown a tu proyecto. Eso es suficiente para que cualquier herramienta de IA moderna indexe esas reglas y te ayude a validar el código en el futuro.