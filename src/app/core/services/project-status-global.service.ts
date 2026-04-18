import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectStatusGlobalService {

  private readonly STORAGE_KEY = 'selected_project_id';
  private selectedProjectId = new BehaviorSubject<string | null>(localStorage.getItem(this.STORAGE_KEY));
  public selectedProjectId$ = this.selectedProjectId.asObservable();

  setSelectedProjectId(id: string | null): void {
    if (id) {
      localStorage.setItem(this.STORAGE_KEY, id);
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.selectedProjectId.next(id);
  }

  getCurrentProjectId(): string | null {
    return this.selectedProjectId.getValue();
  }
}
