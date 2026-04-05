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
}

export const NavigationItems: INavigationItem[] = [
  {
    id: 'main',
    title: 'Main',
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
        breadcrumbs: false
      },
      {
        id: 'about',
        title: 'About',
        type: 'item',
        classes: 'nav-item',
        url: '/about',
        icon: 'bi bi-people',
        breadcrumbs: false
      },
      {
        id: 'design-system',
        title: 'Design System',
        type: 'item',
        classes: 'nav-item',
        url: '/showcase',
        icon: 'bi bi-grid-1x2',
        breadcrumbs: false
      }
    ]
  },
  {
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
  },
  {
    id: 'gestion-inmobiliaria',
    title: 'Gestión Inmobiliaria',
    type: 'group',
    icon: 'bi bi-building',
    children: [
      {
        id: 'lotes',
        title: 'Lotes',
        type: 'item',
        classes: 'nav-item',
        url: '/gestion-inmobiliaria/lotes',
        icon: 'bi bi-geo-alt',
        breadcrumbs: false
      }
    ]
  },
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
        breadcrumbs: false
      }
    ]
  }
];
