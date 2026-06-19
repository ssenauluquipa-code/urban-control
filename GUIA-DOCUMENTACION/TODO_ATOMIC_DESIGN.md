# Guía de Componentes - Atomic Design UrbanControl 🏗️

Este documento centraliza los componentes reutilizables del sistema bajo la metodología **Atomic Design**. Úsalo como referencia al crear formularios, tablas y vistas nuevas.

**Vista previa en vivo:** ruta `/showcase` (`DesignSystemShowcaseComponent`)

**Última actualización:** Mayo 2026

---

## ⚛️ Átomos (Atoms)
Componentes base indivisibles. Ubicación: `src/app/shared/components/atoms/`

### Inputs y formularios

| Componente | Selector | Ruta / archivo | Propósito |
|------------|----------|----------------|-----------|
| **Text Input** | `<app-input-text>` | `input-text/` | Texto con iconos, máscaras y validaciones. |
| **Number Input** | `<app-input-number>` | `input-number/` | Números enteros o decimales con máscara. |
| **Currency Input** | `<app-input-currency>` | `input-currency/` | Monto editable con formato de moneda (locale es-BO). |
| **Date Input** | `<app-input-date>` | `input-date/` | Selector de fecha estandarizado. |
| **Textarea** | `<app-input-textarea>` | `input-textarea/` | Área de texto con contador de caracteres. |
| **Documento Input** | `<app-input-documento>` | `input-documento/` | Número de documento con validación de tipo. |
| **Text Info (readonly)** | `<app-input-text-info>` | `input-text-info.component.ts` | Campo solo lectura con label, copiar y estado vacío/error. |
| **Error Messages** | `<app-input-error-messages>` | `input-error-messages/` | Mensajes de validación (uso interno en inputs). |

### Selectores de datos

| Componente | Selector | Archivo | Propósito |
|------------|----------|---------|-----------|
| **Select Data** | `<app-select-data>` | `select-data.component.ts` | Selector genérico con búsqueda y objetos dinámicos. |
| **Select Projects** | `<app-select-projects>` | `select-projects.component.ts` | Proyectos inmobiliarios. |
| **Select Manzanas** | `<app-select-manzanas>` | `select-manzanas.component.ts` | Manzanas filtrables por proyecto. |
| **Select Lotes** | `<app-select-lotes>` | `select-lotes.component.ts` | Lotes por manzana (precio, área, búsqueda). |
| **Select Clientes** | `<app-select-clientes>` | `select-clientes.component.ts` | Clientes; múltiple y roles Titular/Cotitular. |
| **Select Asesor** | `<app-select-asesor>` | `select-asesor.component.ts` | Asesores de venta con búsqueda remota. |
| **Select Moneda** | `<app-select-moneda>` | `select-moneda.component.ts` | Moneda BS / USD. |

### Selectores de catálogo / perfil

| Componente | Selector | Archivo | Propósito |
|------------|----------|---------|-----------|
| **Select Departamento** | `<app-select-departamento>` | `select-departamento.component.ts` | Departamentos (ubicación). |
| **Select Provincia** | `<app-select-provincia>` | `select-provincia.component.ts` | Provincias según departamento. |
| **Select Expedido** | `<app-select-expedido>` | `select-expedido.component.ts` | Lugar de expedición del documento. |
| **Select Tipo Documento** | `<app-select-document-type>` | `select-document-type.component.ts` | CI, Pasaporte, etc. |
| **Select Género** | `<app-select-gender>` | `select-gender.component.ts` | Género. |
| **Select Estado Civil** | `<app-select-estado-civil>` | `select-estado-civil.component.ts` | Estado civil. |
| **Select Estado Reserva** | `<app-select-estado-reserva>` | `select-estado-reserva.component.ts` | Estados de reserva. |

### Visualización y acción

| Componente | Selector | Archivo | Propósito |
|------------|----------|---------|-----------|
| **Currency Label** | `<app-currency-label>` | `currency-label/` | Monto formateado BS/USD (solo lectura). |
| **Badge Estado** | `<app-badge-estado>` | `badge-estado/` | Etiqueta de estado con color. AG-Grid o template. |
| **Button Action** | `<app-button-action>` | `button-action/` | Botón con loading y tipos NG-Zorro. |
| **Image Uploader** | `<app-image-uploader>` | `image-uploader/` | Subida y previsualización de imagen. |
| **Image Display** | `<app-image-display>` | `image-display/` | Visualización de imagen. |
| **Card Container** | `<app-card-container>` | `card-container/` | Tarjeta con título, icono y slot `card-footer`. |
| **Tab Item** | `<app-tab-item>` | `tab-item/` | Pestaña individual (proyección de contenido). |

### Celdas AG-Grid (átomos/cell renderers)

| Componente | Selector | Archivo | Propósito |
|------------|----------|---------|-----------|
| **Venta Propietarios Cell** | `<app-venta-propietarios-cell>` | `venta-propietarios-cell/` | Propietarios y roles en tabla de ventas. |
| **Status Filter** | `<app-status-filter>` | `status-filter/` | Filtro de estado en toolbar de grid. |

**Estados soportados por `app-badge-estado`:** booleanos (Activo/Inactivo), lotes (`DISPONIBLE`, `RESERVADO`, `VENDIDO`, `BLOQUEADO`), reservas (`ACTIVA`, `VENCIDA`, `CONVERTIDA`, `CANCELADA`), cuotas/pagos (`PENDIENTE`, `PARCIAL`, `PAGADO`, `VENCIDO`, `ANULADO`), y cualquier string (clase CSS = valor en minúsculas).

---

## 🧬 Moléculas (Molecules)
Combinación de átomos. Ubicación: `src/app/shared/components/molecules/`

| Componente | Selector | Archivo | Propósito |
|------------|----------|---------|-----------|
| **Form Field** | `<app-form-field>` | `form-field/` | Label + slot para átomo + errores. |
| **Tipo Pago Selector** | `<app-tipo-pago-selector>` | `tipo-pago-selector.component.ts` | CONTADO vs CUOTAS (botones NG-Zorro). |
| **Método Pago Selector** | `<app-metodo-pago-selector>` | `metodo-pago-selector.component.ts` | EFECTIVO, TRANSFERENCIA, QR, CHEQUE (grilla 2×2). |
| **Frecuencia Pago** | `<app-select-frecuencia-pago>` | `select-frecuencia-pago.component.ts` | Mensual, Quincenal, Semanal, etc. |
| **Día Semana Selector** | `<app-select-dia-semana>` | `select-dia-semana.component.ts` | Día de la semana para pagos semanales. |
| **Día Pago Input** | `<app-input-dia-pago>` | `input-dia-pago.component.ts` | Día fijo del mes (1–31). |
| **Modalidad Calendario** | `<app-modalidad-calendario-selector>` | `modalidad-calendario-selector.component.ts` | Modalidad para pagos quincenales. |
| **Tabs Container** | `<app-tabs-container>` | `tabs-container/` | Pestañas con `app-tab-item` por proyección. |

---

## 🦠 Organismos (Organisms)
Bloques funcionales complejos. Ubicación: `src/app/shared/components/organisms/`

| Componente | Selector | Archivo | Propósito |
|------------|----------|---------|-----------|
| **Data Table** | `<app-data-table>` | `data-table/` | AG-Grid cliente: filtros, acciones por fila, permisos. |
| **Data Table Base** | `<app-data-table-base>` | `data-table-base/` | Base reutilizable de configuración AG-Grid. |
| **Server Data Table** | `<app-data-table-server>` | `data-table-server/` | Paginación y filtros en servidor. |
| **Modal Container** | `<app-modal-container>` | `modal-container/` | Estructura de modal con scroll y footer. |
| **Sub Header** | `<app-sub-header>` | `sub-header/` | Cabecera de sección con acciones. |
| **Table Actions** | `<app-table-actions>` | `table-actions/` | Botones Ver / Editar / Borrar por fila. |
| **Status Floating Filter** | `<app-status-floating-filter>` | `status-floating-filter.component.ts` | Filtro flotante de estado (lotes). |
| **Status Reserva Floating Filter** | `<app-status-reserva-floating-filter>` | `status-reserva-floating-filter.component.ts` | Filtro flotante estados de reserva. |
| **Cliente Floating Filter** | `<app-cliente-floating-filter-wrapper>` | `cliente-floating-filter-wrapper.component.ts` | Filtro flotante de cliente en grid. |
| **Manzana Floating Filter** | `<app-manzana-floating-filter-wrapper>` | `manzana-floating-filter-wrapper.component.ts` | Filtro flotante de manzana en grid. |
| **Venta Tipo Pago Filter** | `<app-venta-tipo-pago-floating-filter>` | `venta-tipo-pago-floating-filter.component.ts` | Filtro CONTADO / CUOTAS en listado ventas. |

---

## 📑 Plantillas (Templates)
Layouts de página. Ubicación: `src/app/shared/components/templates/`

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Page Container** | `<app-page-container>` | Layout con título, breadcrumbs, botones Guardar/Cancelar/Nuevo/Atrás, exportación y permisos (`permissionScope`). |

---

## 🎯 Directivas compartidas
Ubicación: `src/app/shared/components/directives/`

| Directiva | Selector | Propósito |
|-----------|----------|-----------|
| **Can** | `[appCan]` | Muestra/oculta según permisos del módulo. |
| **Drag Modal** | `[appDragModal]` | Permite arrastrar modales NG-Zorro. |

---

## 🧩 Componentes de dominio (por feature)
No están en `shared/` pero siguen Atomic Design dentro de cada feature. Reutilizar dentro del mismo dominio o promover a `shared` si se usan en 2+ módulos.

### Pagos (`features/pagos/`)

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Plan Cuotas Cronograma** | `<app-plan-cuotas-cronograma>` | Grilla de cuotas; carga con `[ventaId]` vía `VentaService.obtenerCuotasPorVenta()` o `[cuotas]` manual. Emite `(onCuotaSelected)`. |
| **Anular Pago Modal** | `<app-anular-pago-modal>` | Modal para anular un pago. |

### Ventas (`features/ventas/`)

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Input Search Reserva** | `<app-input-search-reserva>` | Búsqueda de reserva para convertir a venta. |
| **Modal Search Reserva** | `<app-modal-search-reserva>` | Modal de búsqueda de reservas. |
| **Venta Tipo Pago Cell** | `<app-venta-tipo-pago-cell>` | Celda AG-Grid con tipo de pago y enlace al plan de cuotas. |
| **Anular Venta Modal** | `<app-anular-venta-modal>` | Modal de anulación de venta. |

### Clientes (`features/clientes/`)

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Model Multi Clientes** | `<app-model-multi-clientes>` | Modal/formulario multi-cliente con roles. |
| **Cliente Foto Upload** | `<app-cliente-foto-upload>` | Subida de foto de perfil del cliente. |

### Herramientas

| Componente | Selector | Ruta | Propósito |
|------------|----------|------|-----------|
| **Design System Showcase** | `<app-design-system-showcase>` | `/showcase` | Catálogo visual de átomos, moléculas y organismos. |

---

## 🛠️ Ejemplos de uso

### Selector de clientes

```html
<app-select-clientes
  [input_control]="form.controls.propietarios"
  [multiple]="true"
  [withRoles]="true"
  [maxSelection]="5"
  (Change)="onClientesChange($event)">
</app-select-clientes>
```

### Etiqueta de moneda

```html
<app-currency-label
  [input_value]="montoTotal"
  currency="BS"
  size="large">
</app-currency-label>
```

### Método de pago

```html
<app-metodo-pago-selector
  [input_control]="form.controls.metodo">
</app-metodo-pago-selector>
```

### Cronograma de cuotas (carga desde API)

```html
<app-plan-cuotas-cronograma
  [ventaId]="ventaId"
  (onCuotaSelected)="onCuotaClick($event)">
</app-plan-cuotas-cronograma>
```

Servicio: `VentaService.obtenerCuotasPorVenta(id)` → `GET /api/v1/ventas/:id/cuotas`

### Form field + átomo (patrón obligatorio)

```html
<app-form-field label="Nro. Referencia" [required]="true">
  <app-input-text
    [input_control]="form.controls.numeroReferencia"
    input_placeholder="Ej: REF-001">
  </app-input-text>
</app-form-field>
```

---

## ⚠️ Reglas de uso

### NUNCA usar NG-Zorro directo en formularios si existe un átomo

```html
<!-- ❌ Evitar -->
<app-form-field label="Referencia">
  <input nz-input formControlName="numeroReferencia">
</app-form-field>

<!-- ✅ Correcto -->
<app-form-field label="Referencia">
  <app-input-text [input_control]="form.controls.numeroReferencia"></app-input-text>
</app-form-field>
```

**Beneficios:** validación unificada, estilos consistentes, iconos y máscaras sin duplicar lógica.

### Convención de inputs

| Propiedad típica | Uso |
|------------------|-----|
| `[input_control]` | `FormControl` del formulario reactivo |
| `input_placeholder` | Placeholder en inputs de texto/número |
| `[label]` | En selectores y algunos inputs especializados |

### 📱 Soporte Móvil y Teclados Virtuales (`inputmode`)

Para garantizar una excelente experiencia de usuario en dispositivos móviles y tabletas, es obligatorio que los inputs nativos expongan el teclado adecuado. Dado que usamos `type="text"` combinado con máscaras de entrada (como Maskito), el navegador móvil no sabe por sí mismo qué teclado mostrar.

Para solucionar esto, implementamos el atributo HTML5 `inputmode`:
- **`inputmode="numeric"`**: Muestra el teclado numérico (0-9). Usado en `app-input-number` (cuando no admite decimales) y en el cuerpo de `app-input-documento`.
- **`inputmode="decimal"`**: Muestra el teclado numérico con separador decimal. Usado en `app-input-currency` y `app-input-number` (cuando `allow_decimals = true`).
- **`inputmode="tel"`**: Muestra el teclado telefónico (para números de celular).
- **`inputmode="email"`**: Teclado optimizado para direcciones de correo (con `@` y `.`).

#### Ejemplo de aplicación en átomos de entrada:
```html
<input
  type="text"
  inputmode="numeric"
  [formControl]="input_control"
/>
```

### Promover componentes a `shared`

Si un componente de `features/*/components/` se usa en **dos o más módulos**, moverlo a `shared/components/molecules/` u `organisms/` según corresponda.

---

## 📋 Checklist al crear un componente nuevo

- [ ] ¿Es átomo, molécula u organismo?
- [ ] `standalone: true` e imports explícitos
- [ ] Selector con prefijo `app-`
- [ ] Tipado estricto (sin `any` en `@Input` / `@Output`)
- [ ] Agregar demo en `/showcase` si es reutilizable
- [ ] Actualizar este archivo (`TODO_ATOMIC_DESIGN.md`)
