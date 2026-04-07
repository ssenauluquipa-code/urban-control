import { inject, Injectable, signal, computed } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { AuthRepository } from '../repository/auth.repository';
import { ILoginDto, ILoginResponse } from '../models/auth.model';
import { IUpdateProfileDto, IUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private repo = inject(AuthRepository);

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
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this._currentUser.set(response.user);
  }

  logout(): Observable<void> {
    return this.repo.logout().pipe(
      tap(() => {
        localStorage.clear();
        this._currentUser.set(null);
      })
    );
  }

  getProfile(): Observable<IUser> {
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

  updateProfile(data: IUpdateProfileDto): Observable<IUser> {
    return this.repo.updateProfile(data).pipe(
      tap(user => {
        this._currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  refreshToken(): Observable<ILoginResponse>{
    // Obtenemos el token de refresco guardado
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      this.logout().subscribe();
      return throwError(() => new Error('No refresh token available'));
    }

    // Llamamos al repo pasando el DTO requerido
    return this.repo.refreshTokens({ refreshToken }).pipe(
      tap(response => {
        // Usamos tu método existente para actualizar tokens y el Signal del usuario
        this.saveSession(response);
      }),
      catchError(err => {
        // Si el refresh falla (ej: expiró también el refresh token), limpiamos todo
        this.logout().subscribe();
        return throwError(() => err);
      })
    );
  }
}
