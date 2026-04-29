import { Component, inject, OnInit } from '@angular/core';
import { SpinnerComponent } from './shared/spinner.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent implements OnInit {
  title = 'app';
  private authService = inject(AuthService);

  constructor() {
    // Configuración global de todos los modales NgbModal de la aplicación
    const modalConfig = inject(NgbModalConfig);
    modalConfig.backdrop = 'static'; // No se cierra al hacer clic fuera
    modalConfig.keyboard = false;    // No se cierra con la tecla Escape
  }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if(token){
      this.authService.getLoggedUser().subscribe({
        next: (user) => console.log('', user),
        error: (err) => console.error('', err),
      })
    }
  }
}
