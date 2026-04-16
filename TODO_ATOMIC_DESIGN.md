# Guía de Componentes - Atomic Design UrbanControl 🏗️

Este documento centraliza la información sobre los componentes creados en el sistema bajo la metodología de **Atomic Design**. El objetivo es reutilizar estos componentes para mantener la consistencia visual y de comportamiento en toda la aplicación.

---

## ⚛️ Átomos (Atoms)
Componentes base que no se pueden desglosar más.

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Text Input** | `<app-input-text>` | Input de texto estandarizado con soporte para iconos, máscaras y validaciones automáticas. |
| **Number Input** | `<app-input-number>` | Input especializado para números con controles de incremento/decremento. |
| **Textarea** | `<app-input-textarea>` | Área de texto con auto-resize y validaciones. |
| **Select Data** | `<app-select-data>` | Selector dinámico con búsqueda (Typeahead) y carga desde API. |
| **Select Projects** | `<app-select-projects>` | Selector específico para proyectos inmobiliarios. |
| **Button Action** | `<app-button-action>` | Botones con estados de carga (loading) y estilos predefinidos. |
| **Badge Estado** | `<app-badge-estado>` | Etiquetas de colores para estados (Disponible, Vendido, etc). |
| **Currency Label** | `<app-currency-label>` | Formateador de moneda (BS/USD) con diseño limpio. |
| **Image Uploader** | `<app-image-uploader>` | Componente para subir y previsualizar imágenes. |
| **Image Display** | `<app-image-display>` | Visualizador de imágenes con zoom/modal. |
| **Card Container** | `<app-card-container>` | Contenedor base con diseño de tarjeta. |
| **Error Messages** | `<app-input-error-messages>` | Gestor de mensajes de error de validación (usado internamente por los inputs). |

---

## 🧬 Moléculas (Molecules)
Combinación de átomos para formar unidades funcionales.

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Form Field** | `<app-form-field>` | Contenedor de formulario que incluye **Label**, el **Input** (átomo) y el área de **Errores**. |
| **Cliente Selector**| `<app-cliente-selector>` | Buscador avanzado de clientes. |

---

## 🦠 Organismos (Organisms)
Componentes complejos que forman secciones de la interfaz.

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Data Table** | `<app-data-table>` | Tabla avanzada con AG-Grid, paginación, filtros y acciones por fila. |
| **Modal Container**| `<app-modal-container>` | Estructura base para ventanas emergentes. |
| **Sub Header** | `<app-sub-header>` | Cabecera de sección con título y botones de acción. |
| **Table Actions** | `<app-table-actions>` | Grupo de botones (Ver/Editar/Borrar) para las filas de una tabla. |

---

## 📑 Plantillas (Templates)
Estructuras de layout para páginas.

| Componente | Selector | Propósito |
|------------|----------|-----------|
| **Page Container** | `<app-page-container>` | Layout principal que incluye Breadcrumbs, Título de página y contenedor de contenido. |

---

## ⚠️ Aclaración Importante: Uso de `app-form-field`

Para mantener la estandarización, **NUNCA** se deben usar componentes nativos o directos de NG-Zorro (`nz-input`, `nz-select`) dentro de los formularios si ya existe un átomo creado para ello.

### ❌ Uso Incorrecto (Evitar)
No uses el `nz-input` directamente. Esto rompe la consistencia de validaciones y estilos.
```html
<app-form-field label="Referencia">
  <!-- EVITAR ESTO -->
  <input nz-input formControlName="numeroReferencia">
</app-form-field>
```

### ✅ Uso Correcto (Recomendado)
Debes usar el átomo correspondiente (`app-input-text`, `app-input-number`, etc.) dentro de la molécula `app-form-field`.
```html
<app-form-field label="Nro. Referencia">
  <app-input-text 
    [input_control]="form.controls.numeroReferencia"
    input_placeholder="Ej: REF-001">
  </app-input-text>
</app-form-field>
```

**Beneficios del uso correcto:**
1. **Validación Automática:** Los átomos ya incluyen el componente de mensajes de error.
2. **Estilos Unificados:** Si cambiamos el diseño de los inputs, se actualiza en todo el sistema.
3. **Funcionalidad Extra:** Soporte nativo para iconos, máscaras y estados de enfoque.
