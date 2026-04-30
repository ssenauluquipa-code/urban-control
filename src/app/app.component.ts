import { Component, inject } from '@angular/core';
import { SpinnerComponent } from './shared/spinner.component';
import { RouterOutlet } from '@angular/router';
import { NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent {
  title = 'app';

  constructor() {
    // Configuración global de todos los modales NgbModal de la aplicación
    const modalConfig = inject(NgbModalConfig);
    modalConfig.backdrop = 'static'; // No se cierra al hacer clic fuera
    modalConfig.keyboard = false;    // No se cierra con la tecla Escape
  }
}
