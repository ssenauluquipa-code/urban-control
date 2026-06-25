import { EAppModule } from "src/app/core/config/permissions.enum";

export interface INavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  groupClasses?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: INavigationItem[];
  link?: string;
  description?: string;
  path?: string;
  module?: EAppModule;
}

export const NavigationItems: INavigationItem[] = [
  {
    id: 'main',
    title: 'Inicio',
    type: 'group',
    icon: 'bi bi-house',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard',
        icon: 'bi bi-speedometer2',
        breadcrumbs: false,
        exactMatch: true
      },
      {
        id: 'plano-lotes-nav',
        title: 'Plano de Lotes',
        type: 'item',
        classes: 'nav-item',
        url: '/dashboard/plano',
        icon: 'bi bi-map',
        module: EAppModule.LOTES
      },
      /*
            {
              id: 'about',
              title: 'About',
              type: 'item',
              classes: 'nav-item',
              url: '/about',
              icon: 'bi bi-people',
              breadcrumbs: false
            },
      */
      /* {
        id: 'design-system',
        title: 'Design System',
        type: 'item',
        classes: 'nav-item',
        url: '/showcase',
        icon: 'bi bi-grid-1x2',
        breadcrumbs: false
      } */
    ]
  },
  {
    id: 'administración',
    title: 'Administración',
    type: 'group',
    icon: 'bi bi-person-gear',
    children: [
      {
        id: 'usuarios-admin',
        title: 'Gestión Usuarios',
        type: 'item',
        classes: 'nav-item',
        url: '/admin/usuarios',
        icon: 'bi bi-people',
        breadcrumbs: false,
        module: EAppModule.USUARIOS
      },
      {
        id: 'clientes',
        title: 'Gestión Clientes',
        type: 'item',
        classes: 'nav-item',
        url: '/clientes',
        icon: 'bi bi-person-lines-fill',
        breadcrumbs: false,
        module: EAppModule.CLIENTES
      },
      {
        id: 'asesores',
        title: 'Gestión Asesores',
        type: 'item',
        classes: 'nav-item',
        url: '/asesores',
        icon: 'bi bi-person-badge-fill',
        breadcrumbs: false,
        module: EAppModule.ASESORES
      },
      {
        id: 'reservas',
        title: 'Gestión Reservas',
        type: 'item',
        classes: 'nav-item',
        url: '/reservas',
        icon: 'bi bi-calendar-check',
        breadcrumbs: false,
        module: EAppModule.RESERVAS
      },
      {
        id: 'ventas',
        title: 'Gestión Ventas',
        type: 'item',
        classes: 'nav-item',
        url: '/ventas',
        icon: 'bi bi-cart-check',
        breadcrumbs: false,
        module: EAppModule.VENTAS
      },
      {
        id: 'pagos',
        title: 'Gestión Pagos',
        type: 'item',
        classes: 'nav-item',
        url: '/pagos',
        icon: 'bi bi-cash-stack',
        breadcrumbs: false,
        module: EAppModule.PAGOS
      }
    ]
  },
  /*{
    id: 'access',
    title: 'Acceso y Privilegios',
    type: 'group',
    icon: 'bi bi-shield-lock',
    children: [
      {
        id: 'access-collapse',
        title: 'Acceso y Privilegios',
        type: 'collapse',
        icon: 'bi bi-shield-lock',
        children: [
          {
            id: 'usuarios',
            title: 'Usuarios',
            type: 'item',
            classes: 'nav-item',
            url: '/access/usuarios',
            icon: 'bi bi-people',
            breadcrumbs: false
          },
          {
            id: 'roles',
            title: 'Roles',
            type: 'item',
            classes: 'nav-item',
            url: '/access/roles',
            icon: 'bi bi-person-badge',
            breadcrumbs: false
          },
          {
            id: 'permisos',
            title: 'Permisos',
            type: 'item',
            classes: 'nav-item',
            url: '/access/permisos',
            icon: 'bi bi-key',
            breadcrumbs: false
          }
        ]
      }
    ]
  },*/
  {
    id: 'gestion-inmobiliaria',
    title: 'Gestión Inmobiliaria',
    type: 'group',
    icon: 'bi bi-building',
    children: [
      {
        id: 'proyectos',
        title: 'Urbanizaciónes',
        type: 'item',
        classes: 'nav-item',
        url: '/gestion-inmobiliaria/proyecto',
        icon: 'bi bi-folder2-open',
        breadcrumbs: false,
        module: EAppModule.PROYECTOS
      },
      {
        id: 'manzanas',
        title: 'Manzanas',
        type: 'item',
        classes: 'nav-item',
        url: '/gestion-inmobiliaria/manzanas',
        icon: 'bi bi-grid-3x3',
        breadcrumbs: false,
        module: EAppModule.MANZANAS
      },
      {
        id: 'lotes',
        title: 'Lotes',
        type: 'item',
        classes: 'nav-item',
        url: '/gestion-inmobiliaria/lotes',
        icon: 'bi bi-geo-alt',
        breadcrumbs: false,
        module: EAppModule.LOTES
      }
    ]
  },
  {
    id: 'reportes',
    title: 'Reportes',
    type: 'group',
    icon: 'bi bi-file-earmark-bar-graph',
    children: [
      {
        id: 'reporte-hub',
        title: 'Reportes',
        type: 'item',
        classes: 'nav-item',
        url: '/reportes/reporte-hub',
        icon: 'bi bi-bar-chart',
        breadcrumbs: false,
        module: EAppModule.REPORTES
      }
    ]
  },
  /*
    {
      id: 'ui-components',
      title: 'UI Components',
      type: 'group',
      icon: 'bi bi-layers',
      children: [
        {
          id: 'alert',
          title: 'Alert',
          type: 'item',
          classes: 'nav-item',
          url: '/component/alert',
          icon: 'bi bi-bell',
          breadcrumbs: false
        },
        {
          id: 'badges',
          title: 'Badges',
          type: 'item',
          classes: 'nav-item',
          url: '/component/badges',
          icon: 'bi bi-patch-check',
          breadcrumbs: false
        },
        {
          id: 'buttons',
          title: 'Button',
          type: 'item',
          classes: 'nav-item',
          url: '/component/buttons',
          icon: 'bi bi-hdd-stack',
          breadcrumbs: false
        },
        {
          id: 'card',
          title: 'Card',
          type: 'item',
          classes: 'nav-item',
          url: '/component/card',
          icon: 'bi bi-card-text',
          breadcrumbs: false
        },
        {
          id: 'dropdown',
          title: 'Dropdown',
          type: 'item',
          classes: 'nav-item',
          url: '/component/dropdown',
          icon: 'bi bi-menu-app',
          breadcrumbs: false
        }
      ]
    },
  */
  /*
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'bi bi-compass',
      children: [
        {
          id: 'pagination',
          title: 'Pagination',
          type: 'item',
          classes: 'nav-item',
          url: '/component/pagination',
          icon: 'bi bi-dice-1',
          breadcrumbs: false
        },
        {
          id: 'nav',
          title: 'Nav',
          type: 'item',
          classes: 'nav-item',
          url: '/component/nav',
          icon: 'bi bi-pause-btn',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'data',
      title: 'Data Display',
      type: 'group',
      icon: 'bi bi-table',
      children: [
        {
          id: 'table',
          title: 'Table',
          type: 'item',
          classes: 'nav-item',
          url: '/component/table',
          icon: 'bi bi-layout-split',
          breadcrumbs: false
        },
        {
          id: 'Ag-Grid-Angular',
          title: 'Table Ag-Grid-Angular',
          type: 'item',
          classes: 'nav-item',
          url: '/component/Ag-Grid-Angular',
          icon: 'bi bi-table',
          breadcrumbs: false
        }
      ]
    },
  */
  {
    id: 'configuracion-group',
    title: 'Configuración',
    type: 'group',
    icon: 'bi bi-gear',
    children: [
      {
        id: 'empresa',
        title: 'Empresa',
        type: 'item',
        classes: 'nav-item',
        url: '/configuracion/empresa',
        icon: 'bi bi-building-gear',
        breadcrumbs: false,
        module: EAppModule.EMPRESA
      }
    ]
  }
];
