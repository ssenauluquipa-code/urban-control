import { Injectable, signal, computed, Inject, inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, Observable, of, retry, switchMap, tap, throwError } from 'rxjs';
import { ILoginDto, ILoginResponse } from '../models/auth.model';
import { IUpdateProfileDto, IUser } from '../models/user.model';
import { AUTH_REPOSITORY_TOKEN, IAuthRepository } from '../interfaces/repository/auth.repository.interface';
import { ProjectStatusGlobalService } from './project-status-global.service';

// 🔑 Interface estricta para el Payload inmutable del JWT según el token real del backend
interface IJwtPayload {
  sub: string;        // Identificador del token
  email: string;      // Correo electrónico del usuario logueado
  role: string;       // El rol real ('SUPER_ADMIN', 'ADMIN', 'EDITOR')
  userId: string;     // ID único del usuario (a6a7ae9f-...)
  asesorId: string | null;
  iat: number;        // Fecha de emisión
  exp: number;        // Fecha de expiración del token
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private projectGlobalService = inject(ProjectStatusGlobalService);
  constructor(@Inject(AUTH_REPOSITORY_TOKEN) private repo: IAuthRepository) { }

  private _currentUser = signal<IUser | null>(null);
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => !!this._currentUser());

  private isLoggingOut = false; // Flag para evitar llamadas recursivas

  /**
   * Extrae de forma segura el ID del usuario directamente desde el fragmento firmado del JWT.
   * Evita por completo depender de strings editables en el localStorage.
   */
  public getUserIdFromToken():string | null {
    const token = this.getToken();
    if(!token) return null;

    try{
      // El JWT es: Header.Payload.Signature. Tomamos el cuerpo central (Payload) en la posición [1]
      const payLoadPart = token.split('.')[1];
      if (!payLoadPart) return null;
      // decodificamos nativamente  usando atob (con caracteres UTF-8)
      const decodePayLoad = JSON.parse(atob(payLoadPart)) as IJwtPayload;
      // Validación de expiración matemática: si el token ya venció en tiempo Unix, retornamos null
      const currentTime = Math.floor(Date.now() / 1000);
      if(decodePayLoad.exp < currentTime){
        return null;
      }
      return decodePayLoad.userId;
    }catch(e){
      console.error("Error critico decodificando el token en frontend", e);
      return null;
    }
  }
  /**
   * Login Encadenado: Guarda las firmas del backend y descarga el perfil real a la RAM.
   */
  login(credentials: ILoginDto): Observable<IUser> {
    return this.repo.login(credentials).pipe(
      tap(response => {
        // Almacenamos ÚNICAMENTE los tokens. El navegador los necesita para mantener activa la sesión.
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }),
      // Tras el login exitoso, encadenamos inmediatamente la llamada a 'getLoggedUser' 
      // para traer el perfil real antes de saltar visualmente al Dashboard.
      switchMap(() => this.getLoggedUser())
    );
  }

/*   private getUserFromStorage(): IUser | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
 */
  /* private saveSession(response: ILoginResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this._currentUser.set(response.user);
  } */

  logout(): Observable<void> {
    // Evitar múltiples logouts concurrentes
    if (this.isLoggingOut) {
      return of(undefined);
    }

    this.isLoggingOut = true;

    // Intentamos avisar al servidor, pero garantizamos la limpieza local pase lo que pase
    return this.repo.logout().pipe(
      finalize(() => {
        localStorage.clear();
        this._currentUser.set(null);
        this.projectGlobalService.setSelectedProjectId(null);
        this.isLoggingOut = false;
        this.router.navigate(['/auth/login']);
      }),
      catchError(() => {
        // Evitar que errores de red/401 en el logout intenten refrescar nuevamente
        return of(undefined);
      })
    );
  }

  /**
   * Fuente de Verdad: Obtiene el perfil verificado del servidor y lo inyecta en el Signal (RAM)
   */
  getLoggedUser(): Observable<IUser> {
    return this.repo.getLoggedUser().pipe(
      tap(user => {
        this._currentUser.set(user);
        //localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError((err) => {
        this.logout().subscribe();
        return throwError(()=> err);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  updateLoggedUser(data: IUpdateProfileDto): Observable<IUser> {
    return this.repo.updateLoggedUser(data).pipe(
      tap(user => {
        this._currentUser.set(user);
        //localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  refresh(): Observable<ILoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.logout().subscribe();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.repo.refresh({ refreshToken }).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }),
      catchError(err => {
        // No llamar logout aquí, el interceptor lo hará
        return throwError(() => err);
      })
    );
  }
}
