import { Component, Input, OnChanges, OnInit, Optional, SimpleChanges } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { ILote, TEstadoLote } from 'src/app/core/models/lote/lote.model';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { CurrencyLabelComponent } from 'src/app/shared/components/atoms/currency-label/currency-label.component';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lote-detail',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    NzDescriptionsModule,
    NzImageModule,
    NzSpinModule,
    BadgeEstadoComponent,
    CurrencyLabelComponent,
  ],
  templateUrl: './lote-detail.component.html',
  styleUrl: './lote-detail.component.scss'
})
export class LoteDetailComponent implements OnInit, OnChanges {

  @Input() loteId!: string;
  public lote: ILote | null = null;
  public loading = true;

  // Agrega esta variable para controlar la galería
  public selectedImage: string | null = null;

  constructor(private loteService: LoteService,
    @Optional() private drawerRef: NzDrawerRef,
    @Optional() private activeModal: NgbActiveModal) {
  }

  ngOnInit(): void {
    this.loadDetail();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loteId'] && !changes['loteId'].firstChange) {
      this.loadDetail();
    }
  }
  private loadDetail(): void {
    if (this.loteId) {
      this.loading = true;
      this.selectedImage = null; // Resetear la imagen seleccionada al cambiar de lote
      this.loteService.getLoteById(this.loteId)
        .pipe(finalize(() => this.loading = false))
        .subscribe(data => {
          this.lote = data;
        });
    }
  }
  public closeDrawer(): void {
    if (this.drawerRef) {
      this.drawerRef.close();
    } else if (this.activeModal) {
      this.activeModal.dismiss();
    }
  }

  // Helper para colores del estado
  public getStatusBgColor(estado: TEstadoLote): string {
    switch (estado) {
      case TEstadoLote.DISPONIBLE: return '#006c49'; // Verde
      case TEstadoLote.RESERVADO: return '#d97706'; // Naranja
      case TEstadoLote.VENDIDO: return '#dc2626'; // Rojo
      default: return '#6b7280'; // Gris
    }
  }
}
