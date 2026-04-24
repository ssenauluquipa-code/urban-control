import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ICliente } from 'src/app/core/models/cliente.model';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';

@Component({
  selector: 'app-view-client-detail',
  standalone: true,
  imports: [CardContainerComponent, InputTextInfoComponent, CommonModule],
  templateUrl: './view-client-detail.component.html',
  styleUrl: './view-client-detail.component.scss'
})
export class ViewClientDetailComponent {
  @Input() cliente: ICliente | null = null;
}
