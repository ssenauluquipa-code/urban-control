# 📄 Documentación: PageContainerComponent

El `PageContainerComponent` es un **Template Component** diseñado para estandarizar el layout de todas las vistas principales de la aplicación. Su función principal es envolver el contenido de la página y gestionar automáticamente el `SubHeader` (título y botones de acción).

## 🚀 Funciones Principales
1. **Layout Consistente:** Asegura que todas las páginas tengan el mismo espaciado y estructura.
2. **Gestión de Acciones:** Centraliza la lógica de los botones (Nuevo, Guardar, Eliminar, etc.).
3. **Integración con Permisos:** Usa `permissionScope` para mostrar u ocultar acciones según el rol del usuario.

---

## 🛠️ Propiedades (Inputs)

### Configuración Básica
- `title`: (string) El título que aparecerá en la parte superior izquierda.
- `permissionScope`: (string) El módulo al que pertenece la página (ej: `'lotes'`, `'clientes'`).
- `backRoute`: (string[]) Ruta de navegación para el botón de retroceso (ej: `['/proyectos/lista']`).

### Visibilidad de Botones (Booleanos)
Puedes activar los botones estándar simplemente pasando el atributo:
- `showNew`: Muestra el botón de "Nuevo".
- `showSave`: Muestra el botón de "Guardar".
- `showEdit`: Muestra el botón de "Editar".
- `showDelete`: Muestra el botón de "Eliminar" (o Anular).
- `showBack`: Muestra el botón de "Atrás".
- `showCancel`: Muestra el botón de "Cancelar".

### Menú de Opciones (Tres puntos)
- `showOptions`: Activa el menú desplegable de opciones extra.
- `showExportExcel`: Opción "Exportar Excel" dentro del menú.
- `showPrint`: Opción "Imprimir" dentro del menú.
- `showLog`: Opción "Ver Historial" dentro del menú.

---

## ⚡ Eventos (Outputs)

Cuando el usuario hace clic en un botón, el componente emite un evento que debes capturar en tu componente padre:

- `(AddNew)`: Clic en el botón Nuevo.
- `(Save)`: Clic en el botón Guardar.
- `(Delete)`: Clic en el botón Eliminar.
- `(Cancel)`: Clic en el botón Cancelar o Atrás.
- `(MenuExportExcel)`: Clic en Exportar desde el menú.

---

## 💡 Ejemplo de Uso

```html
<app-page-container
  title="Gestión de Lotes"
  permissionScope="lotes"
  [showNew]="true"
  [showOptions]="true"
  [showExportExcel]="true"
  (AddNew)="onAddNewLote()"
  (MenuExportExcel)="exportarData()"
>

  <!-- Todo lo que pongas aquí será el CONTENIDO de tu página -->
  <div class="mi-tabla-o-formulario">
    <app-data-table ...></app-data-table>
  </div>

  <!-- OPCIONAL: Si necesitas botones EXTRAS que no son los estándar -->
  <div custom-actions>
    <button class="btn btn-info">Acción Especial</button>
  </div>

</app-page-container>
```

---

## 🧩 Acciones Personalizadas (`custom-actions`)
Si necesitas agregar un botón que no existe en el estándar (ej: "Aprobar", "Validar"), puedes usar el selector `custom-actions`. El contenido se inyectará automáticamente al lado de los botones principales respetando el diseño.

```html
<div custom-actions>
  <button class="btn btn-warning">Mi Botón</button>
</div>
```
