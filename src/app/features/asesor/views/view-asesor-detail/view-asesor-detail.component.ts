import { Component, Input } from '@angular/core';
import { IAsesor } from 'src/app/core/models/asesor/asesor.model';
import { CommonModule } from '@angular/common';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';

@Component({
  selector: 'app-view-asesor-detail',
  standalone: true,
  imports: [CommonModule,
    CardContainerComponent,
    InputTextInfoComponent],
  templateUrl: './view-asesor-detail.component.html',
  styleUrl: './view-asesor-detail.component.scss'
})
export class ViewAsesorDetailComponent {

  @Input() asesor: IAsesor | null = null;

}
