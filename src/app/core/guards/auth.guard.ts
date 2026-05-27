import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs';

/**
 * Guard de autenticación con restauración automática de sesión.
 *
 * Flujo:
 * 1. Si el usuario ya está en RAM → pasa directo ✅
 * 2. Si no está en RAM pero hay token en localStorage → intenta restaurar
 *    llamando a getLoggedUser() contra el servidor.
 *    - Si el servidor responde OK → restaura el usuario en RAM y deja pasar ✅
 *    - Si el token expiró o es inválido → manda al login ❌
 * 3. Si no hay token en localStorage → manda al login ❌
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Usuario ya en memoria (navegación normal sin reload)
  if (authService.isAuthenticated()) {
    return true;
  }

  // 2. ¿Hay token guardado en localStorage? Intentamos restaurar la sesión
  const token = authService.getToken();
  if (token) {
    return authService.getLoggedUser().pipe(
      map(() => true),  // Sesión restaurada exitosamente
      catchError(() => {
        // Token inválido o expirado, redirigir al login
        router.navigate(['/auth/login']);
        return of(false);
      })
    );
  }

  // 3. No hay token, no hay sesión → login
  router.navigate(['/auth/login']);
  return false;
};
