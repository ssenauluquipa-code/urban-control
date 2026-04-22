import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IReserva } from 'src/app/core/models/reserva.model';
import { CardContainerComponent } from "src/app/shared/components/atoms/card-container/card-container.component";
import { InputTextInfoComponent } from "src/app/shared/components/atoms/input-text-info.component";

@Component({
  selector: 'app-view-detail-reserva',
  standalone: true,
  imports: [CardContainerComponent, InputTextInfoComponent, DatePipe],
  templateUrl: './view-detail-reserva.component.html',
  styleUrl: './view-detail-reserva.component.scss'
})
export class ViewDetailReservaComponent {

  @Input() reserva: IReserva | null = null;

  getStatusColor(estado: string): string {
    switch (estado) {
      case 'ACTIVA': return 'orange';
      case 'VENCIDA': return 'red';
      case 'CONVERTIDA': return 'green';
      default: return 'default';
    }
  }

}
