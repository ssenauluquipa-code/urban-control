# Atomic Design Core Kit - UrbanControl ✅ COMPLETADO

## Atoms
- [x] badge-estado (ts, html, scss)
- [x] button-action (ts, html, scss)
- [x] currency-label (ts, html, scss)

## Molecules
- [x] form-field (ts, html, scss)
- [x] cliente-selector (ts, html, scss)

## Organisms
- [x] data-grid (ts, html, scss)

## Feature
- [x] design-system-showcase (ts, html, scss)

## Routing
- [x] Add showcase route to app-routing.module.ts

---

## Cómo usar los componentes:

### Badge Estado
```html
<app-badge-estado estado="DISPONIBLE"></app-badge-estado>
<app-badge-estado estado="VENDIDO"></app-badge-estado>
<app-badge-estado estado="RESERVADO"></app-badge-estado>
```

### Button Action
```html
<app-button-action (action)="onClick($event)">Primary</app-button-action>
<app-button-action nzType="default">Default</app-button-action>
<app-button-action [loading]="true">Loading</app-button-action>
```

### Currency Label
```html
<app-currency-label [amount]="50000" currency="BS"></app-currency-label>
<app-currency-label [amount]="1500.50" currency="USD"></app-currency-label>
```

### Form Field
```html
<app-form-field 
  label="Nombre completo" 
  placeholder="Ingrese su nombre"
  errorMessage="El nombre es requerido">
</app-form-field>
```

### Cliente Selector
```html
<app-cliente-selector 
  [clientes]="clientes"
  (search)="onSearchCliente($event)">
</app-cliente-selector>
```

### Data Grid
```html
<app-data-grid
  [rowData]="gridData"
  [columnDefs]="gridColumns"
  (gridReady)="onGridReady($event)">
</app-data-grid>
```

---

## Para ver el Showcase:
1. Ejecuta: `ng serve`
2. Abre: http://localhost:4200/showcase
