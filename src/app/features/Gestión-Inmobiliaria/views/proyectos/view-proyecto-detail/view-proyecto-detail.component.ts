import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IProyecto } from 'src/app/core/models/proyectos/proyecto.model';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';

@Component({
  selector: 'app-view-proyecto-detail',
  standalone: true,
  imports: [CommonModule, InputTextInfoComponent],
  templateUrl: './view-proyecto-detail.component.html',
  styles: []
})
export class ViewProyectoDetailComponent {
  @Input() proyecto: IProyecto | null = null;
  @Input() loading = false;
}
