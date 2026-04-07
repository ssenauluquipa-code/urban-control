import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILoginResponse, ILoginDto, RefreshTokenDto } from '../models/auth.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { IAuthRepository } from '../interfaces/repository/auth.repository.interface';
import { IUser, IUpdateProfileDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthRepository implements IAuthRepository {

  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'urban_control_token';
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  

  login(credentials: ILoginDto): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {});
  }

  refreshTokens(data: RefreshTokenDto): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.apiUrl}/refresh`, data);
  }

  getLoggedUser(): Observable<IUser> {
    return this.http.get<IUser>(`${this.apiUrl}/logged-user`);
  }

  updateProfile(data: IUpdateProfileDto): Observable<IUser> {
    return this.http.patch<IUser>(`${this.apiUrl}/logged-user`, data);
  }

  
}
