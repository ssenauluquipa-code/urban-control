import { EAppAction, EAppModule, EAppRole } from "./permissions.enum";

type PermissionMap = Partial<Record<EAppRole, Partial<Record<EAppModule, EAppAction[]>>>>;

export const APP_PERMISSIONS_MATRIX: PermissionMap = {
    [EAppRole.ADMIN]: {
        [EAppModule.CLIENTES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT],
        [EAppModule.VENTAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR],
        [EAppModule.USUARIOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT],
        [EAppModule.EMPRESA]: [EAppAction.VIEW, EAppAction.EDIT],
        // Nuevo módulo PAGOS con permisos completos
        [EAppModule.PAGOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ANULAR],
        [EAppModule.RESERVAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ANULAR, EAppAction.DELETE, EAppAction.VENTA]
    },
    [EAppRole.EDITOR]: {
        [EAppModule.CLIENTES]: [EAppAction.VIEW], // Solo lectura
        [EAppModule.VENTAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR], // Operación total
        [EAppModule.EMPRESA]: [EAppAction.VIEW], // Solo ver
        // Permiso de anular en PAGOS para editores
        [EAppModule.PAGOS]: [EAppAction.VIEW, EAppAction.EDIT, EAppAction.ANULAR],
        [EAppModule.RESERVAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ANULAR, EAppAction.VENTA]
    }
};