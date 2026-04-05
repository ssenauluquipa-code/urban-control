import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { IAuthResponse, ILoginRequest, IUserSession, UserRole } from '../models/auth.model';
import { AuthRepository } from '../repository/auth.repository';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authRepo = inject(AuthRepository);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<IUserSession | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkInitialSession();
  }

  login(credentials: ILoginRequest) {
    return this.authRepo.login(credentials).pipe(
      tap((response: IAuthResponse) => {
        if (response && response.token) {
          this.authRepo.saveToken(response.token);
          this.currentUserSubject.next({
            access_token: response.token,
            fullName: response.user?.name,
            email: response.user?.email,
            role: response.user?.role,
          });
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  private checkInitialSession(): void {
    const token = this.authRepo.getToken();
    if (token) {
      this.currentUserSubject.next({ access_token: token });
    }
  }

  /*login(credentials: ILoginRequest): Observable<IUserSession> {
    return this.authRepo.signIn(credentials).pipe(
      tap(session => {
        this.authRepo.saveToken(session.access_token);
        this.currentUserSubject.next(session);
      })
    );
  }*/

  logout(): void {
    this.authRepo.deleteToken();
    this.currentUserSubject.next(null);
  }

  getUser(): IUserSession | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserSubject.value?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUserSubject.value?.role as UserRole;
    return roles.includes(userRole);
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get currentUser(): IUserSession | null {
    return this.currentUserSubject.value;
  }
}
