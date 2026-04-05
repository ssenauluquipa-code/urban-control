import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ILoginRequest } from 'src/app/core/models/auth.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ViewLoginComponent } from '../views/view-login/view-login.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from 'src/app/core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ViewLoginComponent],
  template: `
    <app-view-login
      [isLogin]="isLogin"
      [loginGroup]="loginForm"
      (onLogin)="handleAuth($event)"
    ></app-view-login>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  isLogin: boolean = false;
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

  ngOnInit(): void {}

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['ssena-es@gmail.com', [Validators.required, Validators.email]],
      password: ['123456789', [Validators.required]],
    });
  }

  handleAuth(credentials: ILoginRequest): void {
    console.log('credentials recibidas:', JSON.stringify(credentials));
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
