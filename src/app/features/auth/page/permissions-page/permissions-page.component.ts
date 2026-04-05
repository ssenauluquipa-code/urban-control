import { PermissionService } from './../../../../core/services/permission.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IPermisoMatriz, IPermisoUpdate } from 'src/app/core/models/permiso.model';
import { PermissionViewComponent } from '../../views/permission-view/permission-view.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [PermissionViewComponent, AsyncPipe],
  template: `
    <app-permission-view
    [matriz]="matriz$ | async"
      (onGuardar)="guardarCambios($event)">
    </app-permission-view>
  `,
  styles: ``
})
export class PermissionsPageComponent implements OnInit {

  matriz$: Observable<IPermisoMatriz[]>;
  rolIdSeleccionado: number = 1; // Podrías obtenerlo de la ruta o un selector
  constructor(private permissionService : PermissionService){
    this.matriz$ = permissionService.matriz$;
  }
  ngOnInit(): void {
    this.permissionService.cargarMatriz(this.rolIdSeleccionado);
  }

  guardarCambios(cambios: IPermisoUpdate[]):void{
    this.permissionService.guardarCambios(this.rolIdSeleccionado, cambios).subscribe({
      next: () => {
        alert('Permision actualizado cone xitos');
      }
    })
  }

}
