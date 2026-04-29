import { Injectable, signal, computed, Inject } from '@angular/core';
import { catchError, finalize, Observable, of, tap, throwError } from 'rxjs';
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

  private isLoggingOut = false; // Flag para evitar llamadas recursivas

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
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }

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
        this.isLoggingOut = false;
      }),
      catchError(() => {
        // Evitar que errores de red/401 en el logout intenten refrescar nuevamente
        return of(undefined);
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

    if (!refreshToken) {
      this.logout().subscribe();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.repo.refresh({ refreshToken }).pipe(
      tap(response => {
        this.saveSession(response);
      }),
      catchError(err => {
        // No llamar logout aquí, el interceptor lo hará
        return throwError(() => err);
      })
    );
  }
}
