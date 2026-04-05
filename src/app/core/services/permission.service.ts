import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { PermisosRepository } from '../repository/PermisosRepository';
import { IPermisoMatriz, IPermisoUpdate } from '../models/permiso.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private matrizSubject = new BehaviorSubject<IPermisoMatriz[]>([]);
  public matriz$ = this.matrizSubject.asObservable();

  constructor(private permisosRepo: PermisosRepository) {}

  // Carga la matriz en el BehaviorSubject
  cargarMatriz(rolId: number): void {
    this.permisosRepo.getMatrizPorRol(rolId).subscribe({
      next: (data) => this.matrizSubject.next(data),
      error: (err) => console.error('Error cargando permisos', err)
    });
  }

  // Lógica para guardar los cambios
  guardarCambios(rolId: number, cambios: IPermisoUpdate[]): Observable<any> {
    return this.permisosRepo.actualizarPermisos(cambios).pipe(
      tap(() => {
        // Refrescamos la matriz local después de guardar con éxito
        this.cargarMatriz(rolId);
      })
    );
  }

  get matrizActual(): IPermisoMatriz[] {
    return this.matrizSubject.value;
  }

  /**
   * Evaluates if the current user has the specified action permission.
   * Example: can('lotes.create')
   * For now, it returns true by default to avoid breaking existing functionality
   * before a real Auth/Role system is connected.
   */
  can(action: string): boolean {
    // TODO: Implement real permission logic here based on JWT / Roles
    return true;
  }
}
