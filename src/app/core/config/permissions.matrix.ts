import { EAppAction, EAppModule, EAppRole } from "./permissions.enum";

type PermissionMap = Partial<Record<EAppRole, Partial<Record<EAppModule, EAppAction[]>>>>;

export const APP_PERMISSIONS_MATRIX: PermissionMap = {
    [EAppRole.ADMIN]: {
        [EAppModule.CLIENTES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.UPLOAD_PHOTO, EAppAction.REMOVE_IMAGE, EAppAction.DEACTIVATE, EAppAction.ACTIVATE],
        [EAppModule.VENTAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR, EAppAction.DELETE, EAppAction.DEVOLUCION, EAppAction.PLAN_CUENTAS, EAppAction.PAGO, EAppAction.CONTRATOS],
        [EAppModule.USUARIOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DEACTIVATE, EAppAction.ACTIVATE, EAppAction.REMOVE_IMAGE],
        [EAppModule.ASESORES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DEACTIVATE, EAppAction.ACTIVATE],
        [EAppModule.EMPRESA]: [EAppAction.VIEW, EAppAction.EDIT],
        // Nuevo módulo PAGOS con permisos completos
        [EAppModule.PAGOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR, EAppAction.COMPROBANTE],
        [EAppModule.RESERVAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ANULAR, EAppAction.DELETE, EAppAction.VENTA],
        [EAppModule.PROYECTOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DELETE, EAppAction.MASS_LOAD, EAppAction.MANZANAS],
        [EAppModule.MANZANAS]:[EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DELETE, EAppAction.EDIT, EAppAction.LOTES],
        [EAppModule.LOTES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DELETE],
        [EAppModule.REPORTES]: [EAppAction.VIEW,],
    },
    [EAppRole.EDITOR]: {
        [EAppModule.CLIENTES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.UPLOAD_PHOTO, EAppAction.REMOVE_IMAGE, EAppAction.DEACTIVATE, EAppAction.ACTIVATE], // Solo lectura
        [EAppModule.VENTAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR, EAppAction.DELETE, EAppAction.DEVOLUCION, EAppAction.PLAN_CUENTAS, EAppAction.PAGO, EAppAction.CONTRATOS],
        [EAppModule.EMPRESA]: [EAppAction.VIEW], // Solo ver
        // Permiso de anular en PAGOS para editores
        [EAppModule.PAGOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR, EAppAction.COMPROBANTE],
        [EAppModule.RESERVAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ANULAR, EAppAction.VENTA],
        [EAppModule.PROYECTOS]: [EAppAction.VIEW],
        [EAppModule.MANZANAS]:[EAppAction.VIEW],
        [EAppModule.LOTES]: [EAppAction.VIEW],        
        [EAppModule.ASESORES]: [EAppAction.VIEW],
    }
};