import { Component, signal } from '@angular/core';
import { IUpdateProfileDto } from 'src/app/core/models/user.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProfileFormComponent } from '../../views/profile-form/profile-form.component';
import { NzCardModule } from 'ng-zorro-antd/card';

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
              [avatarUrl]="authService.currentUser()?.avatarUrl || ''"
              [loading]="isSaving()"
              (Save)="saveChanges($event)"
              (ImageSelected)="onAvatarSelected($event)">
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

  constructor(public authService: AuthService) { }
  
  onAvatarSelected(file: File) {
    console.log('Imagen lista para subir:', file);
    // Aquí puedes llamar a un servicio para subir la imagen y actualizar el perfil
  }

  saveChanges(data: IUpdateProfileDto) {
    this.isSaving.set(true);
    this.authService.updateProfile(data).subscribe({
      next: () => {
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false)
    });
  }
}

