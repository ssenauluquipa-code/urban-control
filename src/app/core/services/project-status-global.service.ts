import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectStatusGlobalService {

  private selectedProjectId = new BehaviorSubject<string | null>(null);
  public selectedProjectId$ = this.selectedProjectId.asObservable();

  setSelectedProjectId(id: string | null): void {
    this.selectedProjectId.next(id);
  }

  getCurrentProjectId(): string | null {
    return this.selectedProjectId.getValue();
  }
}
