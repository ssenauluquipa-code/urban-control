import { EAppModule } from 'src/app/core/config/permissions.enum';
import { IRouteInfo } from './sidebar.metadata';

export const ROUTES: IRouteInfo[] = [

  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: 'bi bi-speedometer2',
    class: '',
    extralink: false,
    submenu: []
  },
  {
    path: '/gestion-inmobiliaria/lotes',
    title: 'Gestión de Lotes',
    icon: 'bi bi-building',
    class: '',
    extralink: false,
    submenu: [],
    module: EAppModule.LOTES
  },
  {
    path: '/admin/usuarios',
    title: 'Gestión de Usuarios',
    icon: 'bi bi-people-fill',
    class: '',
    extralink: false,
    submenu: [],
    module: EAppModule.USUARIOS
  },
  {
    path: '/clientes',
    title: 'Gestión de Clientes',
    icon: 'bi bi-person-lines-fill',
    class: '',
    extralink: false,
    submenu: [],
    module: EAppModule.CLIENTES
  },
  {
    path: '/asesores',
    title: 'Gestión de Asesores',
    icon: 'bi bi-person-badge-fill',
    class: '',
    extralink: false,
    submenu: [],
    module: EAppModule.ASESORES
  },
  {
    path: '/reservas',
    title: 'Gestión de Reservas',
    icon: 'bi bi-calendar-check',
    class: '',
    extralink: false,
    submenu: [],
    module: EAppModule.RESERVAS
  },
  {
    path: '/ventas',
    title: 'Gestión de Ventas',
    icon: 'bi bi-cart-check',
    class: '',
    extralink: false,
    submenu: [],
    module: EAppModule.VENTAS
  },
  {
    path: '/configuracion/empresa',
    title: 'Configuración',
    icon: 'bi bi-gear',
    class: '',
    extralink: false,
    submenu: [],
    module: EAppModule.EMPRESA
  }
];
