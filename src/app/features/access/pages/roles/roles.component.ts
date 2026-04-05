import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <h4>Roles</h4>
      <p>Gestión de roles del sistema.</p>
    </div>
  `
})
export class RolesComponent {}
