import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
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
    return this.repo.getLoggedUser();
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  updateProfile(data: IUpdateProfileDto): Observable<IUser> {
    return this.repo.updateProfile(data);
  }
}
