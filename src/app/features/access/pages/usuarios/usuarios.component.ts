import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <h4>Usuarios</h4>
      <p>Gestión de usuarios del sistema.</p>
    </div>
  `
})
export class UsuariosComponent {}
