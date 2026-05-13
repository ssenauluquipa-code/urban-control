import { Component, Input } from '@angular/core';
import { IAsesor } from 'src/app/core/models/asesor/asesor.model';
import { CommonModule } from '@angular/common';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';

@Component({
  selector: 'app-view-asesor-detail',
  standalone: true,
  imports: [CommonModule,
    InputTextInfoComponent],
  templateUrl: './view-asesor-detail.component.html',
  styleUrl: './view-asesor-detail.component.scss'
})
export class ViewAsesorDetailComponent {

  @Input() asesor: IAsesor | null = null;
  @Input() loading = false;

}
