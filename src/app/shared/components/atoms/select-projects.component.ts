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
      (ChangeValue)="onSelect($event)">
    </app-select-data>
  `,
  styles: ``
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

  onSelect(event: string | null): void {
    this.Change.emit(event);
  }
}
