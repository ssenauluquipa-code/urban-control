import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { EAppRole, EAppModule, EAppAction } from '../config/permissions.enum';

// Definimos la Matriz directamente aquí por ahora para simplificar
type PermissionMap = Partial<Record<EAppRole, Partial<Record<EAppModule, EAppAction[]>>>>;

export const APP_PERMISSIONS_MATRIX: PermissionMap = {
  [EAppRole.ADMIN]: {
    [EAppModule.CLIENTES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ACTIVATE, EAppAction.DEACTIVATE, EAppAction.DELETE, EAppAction.UPLOAD],
    [EAppModule.ASESORES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ACTIVATE, EAppAction.DEACTIVATE],
    [EAppModule.PROYECTOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DELETE, EAppAction.MASS_LOAD],
    [EAppModule.MANZANAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DELETE],
    [EAppModule.LOTES]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DELETE],
    [EAppModule.RESERVAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR, EAppAction.VENTA],
    [EAppModule.VENTAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR],
    [EAppModule.USUARIOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.ACTIVATE, EAppAction.DEACTIVATE, EAppAction.DELETE, EAppAction.UPLOAD],
    [EAppModule.EMPRESA]: [EAppAction.VIEW, EAppAction.EDIT, EAppAction.CREATE],
    [EAppModule.PAGOS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.EDIT, EAppAction.DELETE],
  },
  [EAppRole.EDITOR]: {
    [EAppModule.CLIENTES]: [EAppAction.VIEW],
    [EAppModule.ASESORES]: [EAppAction.VIEW],
    [EAppModule.PROYECTOS]: [EAppAction.VIEW],
    [EAppModule.MANZANAS]: [EAppAction.VIEW],
    [EAppModule.LOTES]: [EAppAction.VIEW],
    [EAppModule.RESERVAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR, EAppAction.VENTA],
    [EAppModule.VENTAS]: [EAppAction.VIEW, EAppAction.CREATE, EAppAction.ANULAR],
    [EAppModule.EMPRESA]: [EAppAction.VIEW],
    [EAppModule.PAGOS]: [EAppAction.VIEW, EAppAction.CREATE],
  }
};

@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private auth = inject(AuthService);

  can(module: EAppModule, action: EAppAction): boolean {
    const user = this.auth.currentUser();

    if (!user) return false; // Validación de seguridad

    const role = (user.role as string)?.toUpperCase() as EAppRole;

    // 1. Super Admin tiene acceso total
    if (role === EAppRole.SUPER_ADMIN) return true;

    // 2. Verificar si el rol existe en nuestra matriz
    const permissions = APP_PERMISSIONS_MATRIX[role];
    if (!permissions) return false;

    // 3. Verificar si el módulo está permitido para este rol
    const moduleActions = permissions[module];
    if (!moduleActions) return false;

    // 4. Verificar acción específica
    const hasPermission = moduleActions.includes(action);

    // 5. Reglas especiales de negocio
    if (hasPermission && role === EAppRole.EDITOR && !user.asesorId) {
      if ([EAppAction.CREATE, EAppAction.ANULAR].includes(action)) return false;
    }

    return hasPermission;
  }
}
