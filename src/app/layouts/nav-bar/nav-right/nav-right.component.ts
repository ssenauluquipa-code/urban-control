import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProfileFormComponent } from 'src/app/features/profile/views/profile-form/profile-form.component';
import { IUpdateProfileDto } from 'src/app/core/models/user.model';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [RouterModule, NgbNavModule, NgbDropdownModule, NzIconModule],
  templateUrl: './nav-right.component.html',
  styleUrl: './nav-right.component.scss'
})
export class NavRightComponent {
  @Input() styleSelectorToggle = false;
  @Output() Customize = new EventEmitter<void>();
  
  private authService = inject(AuthService);
  private router = inject(Router);
  private modalService = inject(NgbModal);

  windowWidth: number;
  screenFull = true;

  constructor() {
    this.windowWidth = window.innerWidth;
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    });
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  profile = [
    { icon: 'edit', title: 'Edit Profile' },
    { icon: 'user', title: 'View Profile' },
    { icon: 'logout', title: 'Logout' }
  ];

  setting = [
    { icon: 'building', title: 'Organización' },
    { icon: 'user', title: 'Account Settings' },
    { icon: 'lock', title: 'Privacy Center' }
  ];

  handleProfileClick(title: string) {
    if (title === 'Logout') {
      this.logout();
    } else if (title === 'Edit Profile') {
      this.openProfileModal();
    }
  }

  private openProfileModal() {
    const modalRef = this.modalService.open(ProfileFormComponent, { 
      size: 'lg', 
      centered: true,
      backdrop: 'static'
    });

    // Pasar datos al componente
    modalRef.componentInstance.userData = this.currentUser;
    modalRef.componentInstance.avatarUrl = this.currentUser?.avatarUrl;

    // Escuchar eventos del formulario
    modalRef.componentInstance.Save.subscribe((data: IUpdateProfileDto) => {
      modalRef.componentInstance.loading = true;
      this.authService.updateProfile(data).subscribe({
        next: () => {
          modalRef.componentInstance.loading = false;
          modalRef.close();
        },
        error: () => modalRef.componentInstance.loading = false
      });
    });

    modalRef.componentInstance.ImageSelected.subscribe((file: File) => {
      console.log('Imagen para subir desde Nav:', file);
      // Aquí podrías llamar al servicio de subida de imágenes
    });
  }

}

