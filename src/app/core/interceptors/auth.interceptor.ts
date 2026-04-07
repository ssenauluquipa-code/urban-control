import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  //const router = inject(Router);

  // Clona la request con withCredentials para enviar HttpOnly cookies automáticamente
  // 1. Inyectar Token en la cabecera
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  // 2. Manejar errores 401 (Refresh Token Logic)
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/login')) {

        return authService.refreshToken().pipe(
          switchMap((res) => {
            const newAuthReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.accessToken}` }
            });
            return next(newAuthReq);  
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          })
        )
      }
      return throwError(() => error);
    })
  );
};
