import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError, delay } from 'rxjs';
import { IAuthResponse, ILoginRequest, IUserSession } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

const MOCK_USERS = [
  { email: 'admin@test.com', password: '123456', access_token: 'mock-token-admin', fullName: 'Admin User', role: 'SUPER_ADMIN' },
  { email: 'vendedor@test.com', password: '123456', access_token: 'mock-token-vendedor', fullName: 'Vendedor User', role: 'VENDEDOR' },
];

@Injectable({
  providedIn: 'root'
})
export class AuthRepository {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'urban_control_token';
  private readonly apiUrl = `${environment.apiUrl}/Auth`;
  

  login(credentials: ILoginRequest): Observable<IAuthResponse> {
    return this.http.post<IAuthResponse>(this.apiUrl+ "/login", credentials);
  }
  signIn(credentials: ILoginRequest): Observable<IUserSession> {
    const email = credentials.email?.trim().toLowerCase();
    const password = credentials.password?.trim();
    const user = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    if (user) {
      const session: IUserSession = {
        access_token: user.access_token,
        fullName: user.fullName,
        role: user.role,
        email: user.email
      };
      return of(session).pipe(delay(800));
    }
    return throwError(() => new Error('Credenciales incorrectas'));
  }

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  deleteToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
