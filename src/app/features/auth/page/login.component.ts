import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ViewLoginComponent } from '../views/view-login/view-login.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ILoginDto } from 'src/app/core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ViewLoginComponent],
  template: `
    <app-view-login
      [isLogin]="isLogin"
      [loginGroup]="loginForm"
      (login)="handleAuth($event)"
    ></app-view-login>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup({});
  isLogin = false;
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef); // 1. Inyectar
  private notification = inject(NotificationService); // Servicio de Notificaciones centralizado

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.initForm();
  }


  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['superadmin@gmail.com', [Validators.required, Validators.email]],
      password: ['admin0005', [Validators.required]],
    });
  }

  handleAuth(credentials: ILoginDto): void {
    this.isLogin = true;
    this.authService.login(credentials).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLogin = false;
          this.cdr.markForCheck(); // 2. Avisar a Angular que revise la pantalla
          this.notification.success('¡Bienvenido! Inicio de sesión exitoso.');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLogin = false;
          this.cdr.markForCheck(); // 2. Avisar a Angular que revise la pantalla
          this.notification.error('Usuario o contraseña incorrectos. Inténtalo de nuevo.');
          console.error('Error en autenticación:', error);
        },
      })
  }
}
