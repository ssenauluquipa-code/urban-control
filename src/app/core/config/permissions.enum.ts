export enum EAppRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
}

export enum EAppModule {
    PLANO_LOTES = 'PLANO_LOTES',
    USUARIOS = 'USUARIOS',
    CLIENTES = 'CLIENTES',
    ASESORES = 'ASESORES',
    RESERVAS = 'RESERVAS',
    VENTAS = 'VENTAS',
    PROYECTOS = 'PROYECTOS',
    MANZANAS = 'MANZANAS',
    LOTES = 'LOTES',
    EMPRESA = 'EMPRESAS',
    PAGOS = 'PAGOS',
}

export enum EAppAction {
    VIEW = 'VIEW',
    CREATE = 'CREATE',
    EDIT = 'EDIT',
    DELETE = 'DELETE',
    ANULAR = 'ANULAR',
    ACTIVATE = 'ACTIVATE',
    DEACTIVATE = 'DEACTIVATE',
    UPLOAD = 'UPLOAD',
    EXPORT = 'EXPORT',
    IMPORT = 'IMPORT',
    PRINT = 'PRINT',
    VENTA = 'VENTA' // Esta es real de tus tablas
}
