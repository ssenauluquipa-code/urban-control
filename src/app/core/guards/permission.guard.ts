import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AccessControlService } from '../services/access-control.service';
import { EAppModule, EAppAction } from '../config/permissions.enum';

export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const access = inject(AccessControlService);
  const router = inject(Router);

  // Extraer el módulo y la acción requerida de la configuración de la ruta
  const module = route.data['module'] as EAppModule;
  // Si no se especifica acción, por defecto es VIEW
  const action = route.data['action'] as EAppAction || EAppAction.VIEW;

  // Si la ruta no tiene definido un módulo, permitimos el paso por defecto
  if (!module) return true;

  // Validar permiso
  if (access.can(module, action)) {
    return true;
  }

  // Redirigir al dashboard si no tiene permiso
  console.warn(`Acceso denegado a ${module}:${action}`);
  router.navigate(['/dashboard']);
  return false;
};