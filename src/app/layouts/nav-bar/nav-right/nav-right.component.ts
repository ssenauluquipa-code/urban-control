import { Component, EventEmitter, Input, OnInit, Output, inject, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProfileFormComponent } from 'src/app/features/profile/views/profile-form/profile-form.component';
import { IUpdateProfileDto } from 'src/app/core/models/user.model';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { SelectProjectsComponent } from "src/app/shared/components/atoms/select-projects.component";
import { NotificacionBellComponent } from 'src/app/shared/components/molecules/notificacion-bell/notificacion-bell.component';
import { NotificationService } from 'src/app/core/services/notification.service';
import { CommonModule } from '@angular/common';
import { ActividadesDropdownComponent } from "src/app/shared/components/molecules/actividades-dropdown/actividades-dropdown.component";

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NgbNavModule, NgbDropdownModule, NzIconModule, SelectProjectsComponent, NotificacionBellComponent, ActividadesDropdownComponent],
  templateUrl: './nav-right.component.html',
  styleUrl: './nav-right.component.scss'
})
export class NavRightComponent implements OnInit {
  @Input() styleSelectorToggle = false;
  @Output() Customize = new EventEmitter<void>();

  private authService = inject(AuthService);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private globalContext = inject(ProjectStatusGlobalService);
  private projectService = inject(ProyectoService);
  private notification = inject(NotificationService);
  windowWidth: number;
  screenFull = true;

  //Exponemos el signal de solo lectura directamente para optimizar el rendirezado reactivo de la UI
  public currentUser = this.authService.currentUser;

  public globalProjectControl = new FormControl<string>('');
  constructor() {
    this.windowWidth = window.innerWidth;
    // Sincronizamos el FormControl del selector con el Signal global.
    // Esto actualiza el dropdown del navbar cuando otro componente (ej. lis-proyectos)
    // cambia el proyecto activo vía globalContext.setSelectedProjectId()
    effect(() => {
      const projectId = this.globalContext.currentProjectId();
      if (projectId && this.globalProjectControl.value !== projectId) {
        this.globalProjectControl.setValue(projectId, { emitEvent: false });
      }
    });
  }
  ngOnInit(): void {
    // Si la RAM del usuario está limpia en F5 pero hay token, lo cargamos
    if (!this.currentUser() && this.authService.getToken()) {
      this.authService.getLoggedUser().subscribe();
    }
    
    this.projectService.getProyectActive().subscribe(proyectos => {
      const currentId = this.globalContext.getCurrentProjectId();

      // Si no hay proyecto seleccionado, o el seleccionado ya no existe en la lista, ponemos el primero
      const projectExists = proyectos.some(p => p.id === currentId);

      if (proyectos.length > 0 && (!currentId || !projectExists)) {
        const firstId = proyectos[0].id;
        this.globalContext.setSelectedProjectId(firstId);
        this.globalProjectControl.setValue(firstId);
      } else if (currentId && projectExists) {
        this.globalProjectControl.setValue(currentId);
      }
    });
  }

  onProjectChange(projectId: string | null): void {
    this.globalContext.setSelectedProjectId(projectId);
  }

  logout(): void {
    this.authService.logout().subscribe();
    /* this.authService.logout().subscribe(() => {
      this.router.navigate(['/auth/login']);
    }); */
  }

  profile = [
    { icon: 'edit', title: 'Editar Perfil' },
    /* { icon: 'user', title: 'Ver Perfil' }, */
    { icon: 'logout', title: 'Cerrar Sesión' }
  ];

  /* setting = [
    { icon: 'building', title: 'Organización' },
    { icon: 'user', title: 'Configuración de Cuenta' },
    { icon: 'lock', title: 'Centro de Privacidad' }
  ]; */

  handleProfileClick(title: string) {
    if (title === 'Cerrar Sesión') {
      this.logout();
    } else if (title === 'Editar Perfil') {
      this.openProfileModal();
    }
  }

  private openProfileModal() {
    const modalRef = this.modalService.open(ProfileFormComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static'
    });

    // Pasar datos al componente (extraemos el valor del signal con ())
    modalRef.componentInstance.userData = this.currentUser();

    // Escuchar eventos del formulario
    modalRef.componentInstance.Save.subscribe((data: IUpdateProfileDto) => {
      modalRef.componentInstance.loading = true;
      const isPasswordChange = !!data.newPassword;

      this.authService.updateLoggedUser(data).subscribe({
        next: () => {
          modalRef.componentInstance.loading = false;
          modalRef.close();

          if (isPasswordChange) {
            this.notification.success('Tu contraseña ha sido cambiada. Por seguridad, la sesión se cerrará.');
          } else {
            this.notification.success('Perfil actualizado correctamente. Por seguridad, la sesión se cerrará.');
          }

          // Esperamos un poco para que el usuario vea el mensaje
          setTimeout(() => {
            this.logout();
          }, 2000);
        },
        error: (err) => {
          modalRef.componentInstance.loading = false;
          if (err.error && err.error.message) {
            const messages = Array.isArray(err.error.message) ? err.error.message : [err.error.message];
            messages.forEach((msg: string) => this.notification.error(msg));
          } else {
            this.notification.error('Error al actualizar el perfil.');
          }
        }
      });
    });
  }

}

