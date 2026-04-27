import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ProyectoService } from 'src/app/core/services/proyectos/proyecto.service';
import { SelectDataComponent } from './select-data.component';
import { IProyectoActivo } from 'src/app/core/models/proyectos/proyecto.model';

@Component({
  selector: 'app-select-projects',
  standalone: true,
  imports: [SelectDataComponent, ReactiveFormsModule],
  template: `
    <app-select-data
      [itemList]="projectList"
      [inputControl]="inputControl"
      [placeholder]="placeholder"
      [bindValue]="'id'"
      [bindLabel]="'nombre'"
      [customOptionTemplate]="projectTemplate"      
      (ChangeValue)="onSelect($event)">
    </app-select-data>
    
    <ng-template #projectTemplate let-item let-searchTerm="searchTerm">
      <div class="py-1">
        <div class="fw-bold text-primary" [innerHTML]="highlightText(item.nombre, searchTerm)"></div>

        <div class="d-flex gap-2 mt-1" style="font-size: 0.75rem;">
          <span class="text-muted">
            <i class="ph ph-squares-four"></i> Manzanas: <b>{{ item.cantidadManzanas }}</b>
          </span>
          <span class="text-secondary">|</span>
          <span class="text-muted">
            <i class="ph ph-map-pin"></i> Lotes: <b>{{ item.cantidadLotes }}</b>
          </span>
        </div>
      </div>
    </ng-template>

  `,
  styles: [
    `    
  `
  ]
})
export class SelectProjectsComponent implements OnInit {

  @Input() inputControl = new FormControl();
  @Input() placeholder = 'Seleccionar Proyecto...';
  @Output() Change = new EventEmitter<string | null>();

  public projectList: IProyectoActivo[] = [];

  constructor(
    private proyectoService: ProyectoService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.proyectoService.getProyectActive().subscribe({
      next: (data) => {
        this.projectList = [...data];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error al cargar proyectos', error)
    });
  }

  onSelect(event: string | IProyectoActivo | null): void {
    this.Change.emit(event as string | null);
  }

  /**
   * Reutilizamos la lógica de resaltado para que la búsqueda sea visual
   */
  highlightText(fullText: string, searchTerm: string): string {
    if (!searchTerm || !fullText) return fullText;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return fullText.replace(regex, `<span class="highlight-match">$1</span>`);
  }
}
