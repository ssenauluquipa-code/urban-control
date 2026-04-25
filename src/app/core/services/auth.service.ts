import { Injectable, signal, computed, Inject } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { ILoginDto, ILoginResponse } from '../models/auth.model';
import { IUpdateProfileDto, IUser } from '../models/user.model';
import { AUTH_REPOSITORY_TOKEN, IAuthRepository } from '../interfaces/repository/auth.repository.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(@Inject(AUTH_REPOSITORY_TOKEN) private repo: IAuthRepository) { }

  private _currentUser = signal<IUser | null>(this.getUserFromStorage());
  public currentUser = this._currentUser.asReadonly();
  public isAuthenticated = computed(() => !!this._currentUser());

  login(credentials: ILoginDto): Observable<ILoginResponse> {
    return this.repo.login(credentials).pipe(
      tap(response => {
        this.saveSession(response);
      })
    );
  }

  private getUserFromStorage(): IUser | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private saveSession(response: ILoginResponse): void {
    console.log('🔐 [AuthService] Guardando nueva sesión...', { user: response.user.email });
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }

  logout(): Observable<void> {
    console.warn('🚪 [AuthService] Iniciando cierre de sesión (logout)...');
    return this.repo.logout().pipe(
      tap(() => {
        console.log('🧹 [AuthService] Sesión limpiada en localStorage.');
        localStorage.clear();
        this._currentUser.set(null);
      })
    );
  }

  getLoggedUser(): Observable<IUser> {
    return this.repo.getLoggedUser().pipe(
      tap(user => {
        this._currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
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
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  refresh(): Observable<ILoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('🔄 [AuthService] Intentando refrescar token...', refreshToken ? 'Token presente' : 'Token ausente');

    if (!refreshToken) {
      console.error('❌ [AuthService] No hay Refresh Token en Storage.');
      this.logout().subscribe();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.repo.refresh({ refreshToken }).pipe(
      tap(response => {
        console.log('✅ [AuthService] Token refrescado exitosamente.');
        this.saveSession(response);
      }),
      catchError(err => {
        console.error('🔥 [AuthService] El refresco de token falló en el servidor.', err);
        this.logout().subscribe();
        return throwError(() => err);
      })
    );
  }
}
