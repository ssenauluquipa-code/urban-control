import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <h4>Permisos</h4>
      <p>Gestión de permisos del sistema.</p>
    </div>
  `
})
export class PermisosComponent {}
