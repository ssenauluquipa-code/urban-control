import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// 🧊 Variables de estado global para el interceptor (fuera de la función)
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // 1. Inyectar Token en la cabecera si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  // 2. Manejar la petición y capturar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // CONDICIÓN CRÍTICA: No intentar refrescar si el error viene de Login o del propio Refresh
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');

      if (error.status === 401 && !isAuthRequest) {
        return handle401Error(req, next, authService);
      }

      if ((error.status === 401 || error.status === 403) && isAuthRequest) {
        // Forzar logout inmediato sin intentar de nuevo
        authService.logout().subscribe();
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Lógica para manejar el error 401 (Token expirado)
 */
function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Limpiamos el sujeto para nuevas peticiones

    return authService.refresh().pipe(
      switchMap((res) => {
        isRefreshing = false;
        refreshTokenSubject.next(res.accessToken);

        // Reintentamos la petición original con el nuevo token obtenido
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${res.accessToken}` }
        }));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Evitar logout múltiple
        if (refreshError.status === 403 || refreshError.status === 401) {
          authService.logout().subscribe();
        }

        return throwError(() => refreshError);
      })
    );
  } else {
    // Cola de espera: Si ya hay un proceso de refresco en curso,
    // hacemos que esta petición espere a que termine.
    return refreshTokenSubject.pipe(
      filter(token => token !== null), // Esperar a que el token no sea null
      take(1), // Tomar el primer valor válido y completar
      switchMap((newToken) => {
        // Reintentar con el token que acaba de obtener la otra petición
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        }));
      }),
      catchError((err) => {
        authService.logout().subscribe();
        return throwError(() => err);
      })
    );
  }
}
