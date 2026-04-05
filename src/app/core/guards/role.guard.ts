import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: UserRole[] = route.data['roles'];
  if (!requiredRoles || requiredRoles.length === 0) return true;

  const user = authService.currentUser;
  if (user && requiredRoles.includes(user.role as UserRole)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
