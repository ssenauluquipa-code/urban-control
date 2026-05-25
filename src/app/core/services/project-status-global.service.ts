import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectStatusGlobalService {

  private readonly STORAGE_KEY = 'selected_project_id';
  //Inicializamos el Signal leyendo directamente del localStorage para soportar el F5
  private _selectedProjectId = signal<string | null>(localStorage.getItem(this.STORAGE_KEY));
  
  //Lo exponemos como un Signal de solo lectura para consumo global en la App
  public currentProjectId = this._selectedProjectId.asReadonly();

  /**
   * Modifica el proyecto seleccionado tanto en la memoria RAM (Signal) como en el almacenamiento físico
   */
  setSelectedProjectId(id: string | null): void {
    this._selectedProjectId.set(id);

    if (id) {
      localStorage.setItem(this.STORAGE_KEY, id);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Retorna el ID actual en formato string tradicional (mantiene compatibilidad con lógica síncrona)
   */
  getCurrentProjectId(): string | null {
    return this._selectedProjectId();
  }
}
