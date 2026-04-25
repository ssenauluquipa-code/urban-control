import { Component, inject, signal } from '@angular/core';
import { IUpdateProfileDto } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProfileFormComponent } from '../../views/profile-form/profile-form.component';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-edit-page',
  standalone: true,
  imports: [ProfileFormComponent, NzCardModule],
  template: `
    <div class="p-4">
      <div class="row">
        <div class="col-lg-8 offset-lg-2">
          <nz-card nzTitle="Configuración de Perfil">
              <app-profile-form
              [userData]="authService.currentUser()"
              [loading]="isSaving()"
              (Save)="saveChanges($event)">
            </app-profile-form>
          </nz-card>
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class ProfileEditPageComponent {

  isSaving = signal(false);
  private notification = inject(NotificationService);
  private router = inject(Router);

  constructor(public authService: AuthService) { }

  saveChanges(data: IUpdateProfileDto) {
    this.isSaving.set(true);
    const isPasswordChange = !!data.newPassword;

    this.authService.updateLoggedUser(data).subscribe({
      next: () => {
        this.isSaving.set(false);

        if (isPasswordChange) {
          this.notification.success('Tu contraseña ha sido cambiada. Por seguridad, la sesión se cerrará.');
          setTimeout(() => {
            this.authService.logout().subscribe(() => {
              this.router.navigate(['/auth/login']);
            });
          }, 2000);
        } else {
          this.notification.success('Perfil actualizado correctamente.');
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.notification.error('Error al actualizar el perfil.');
      }
    });
  }
}

