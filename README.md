# 🌆 Urban Control - Sistema de Gestión Inmobiliaria

**Urban Control** es una plataforma moderna diseñada para la gestión integral de proyectos de urbanización y control inmobiliario. Construida con Angular 17+, ofrece una interfaz intuitiva, robusta y eficiente para la administración de lotes, clientes, ventas y configuraciones empresariales.

## 🚀 Características Principales

- **Dashboard Interactivo**: Visualización de métricas clave mediante gráficos avanzados (ApexCharts).
- **Gestión de Lotes**: Control detallado del inventario de terrenos, estados de venta y ubicación.
- **Administración de Empresas**: Configuración personalizada de datos fiscales, logotipos y parámetros del sistema.
- **Sistema de Permisos**: Control de acceso granular para usuarios y roles específicos.
- **Diseño Atómico**: Arquitectura de componentes reutilizables basada en principios de Atomic Design.
- **Modales Arrastrables**: UX mejorada con directivas personalizadas para una mayor flexibilidad en la interfaz.

## 🛠️ Stack Tecnológico

- **Framework**: Angular 17.3+ (Standalone Components & Signals ready).
- **UI Libraries**: 
  - [Bootstrap 5](https://getbootstrap.com/)
  - [NG-Zorro Ant Design](https://ng.ant.design/)
  - [NG-Select](https://github.com/ng-select/ng-select)
- **Charts**: [ApexCharts](https://apexcharts.com/)
- **Data Grid**: [AG-Grid](https://www.ag-grid.com/)
- **Styling**: SCSS (Arquitectura modular).

## 📦 Instalación y Uso

1. **Clonar el repositorio**:
    ```bash
    git clone https://github.com/ssenauluquipa-code/urban-control.git
    cd urban-control
    ```

2. **Instalar dependencias**:
    ```bash
    npm install
    ```

3. **Servidor de desarrollo**:
    Ejecuta `ng serve` para iniciar el servidor. Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente al detectar cambios.

## 🏗️ Construcción (Build)

Para generar el bundle de producción:

```bash
ng build
