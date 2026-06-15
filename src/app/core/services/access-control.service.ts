import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { EAppRole, EAppModule, EAppAction } from '../config/permissions.enum';

import { APP_PERMISSIONS_MATRIX } from '../config/permissions.matrix';

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
