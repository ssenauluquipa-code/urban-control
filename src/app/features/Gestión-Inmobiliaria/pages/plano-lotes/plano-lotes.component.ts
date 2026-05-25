import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, of } from 'rxjs';
import { ILote } from 'src/app/core/models/lote/lote.model';
import { ProjectStatusGlobalService } from 'src/app/core/services/project-status-global.service';
import { LoteService } from 'src/app/core/services/proyectos/lote.service';
import { LoteVisualizerComponent } from "../../views/lote-visualizer/lote-visualizer.component";
import { SelectManzanasComponent } from 'src/app/shared/components/atoms/select-manzanas.component';
import { CommonModule } from '@angular/common';
import { CardContainerComponent } from "src/app/shared/components/atoms/card-container/card-container.component";
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LoteDetailComponent } from '../../views/lotes/lote-detail/lote-detail.component';
import { NzDrawerService } from 'ng-zorro-antd/drawer';

export interface IManzanaGroup {
  nombre: string;
  lotes: ILote[];
}

@Component({
  selector: 'app-plano-lotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoteVisualizerComponent, SelectManzanasComponent, CardContainerComponent, PageContainerComponent,],
  providers: [NzDrawerService],
  templateUrl: './plano-lotes.component.html',
})
export class PlanoLotesComponent implements OnInit {

  private _lotesService = inject(LoteService);
  // Inyectamos el contexto global tal como lo usas en list-lotes
  private _globalContext = inject(ProjectStatusGlobalService);
  private modalService = inject(NgbModal);
  private breakpointObserver = inject(BreakpointObserver);
  private drawerService = inject(NzDrawerService);

  public manzanaIdControl = new FormControl<string | null>(null);
  public groupedLotes = signal<IManzanaGroup[]>([]);
  public proyectoId : string | null = null;

  constructor(){
    /**
     * 🚀 EFECTO REACTIVO CENTRAL:
     * Resuelve el error de compilación. Escucha el Signal global del proyecto
     * y tipa rigurosamente el parámetro como string | null (Evitando tipos any).
     */
    effect(() => {
      const projectId: string | null = this._globalContext.currentProjectId();
      this.proyectoId = projectId;

      if (projectId) {
        this.manzanaIdControl.enable({ emitEvent: false });
        this.manzanaIdControl.setValue(null, { emitEvent: false });
        this.loadLotes(null);
      } else {
        this.manzanaIdControl.disable({ emitEvent: false });
        this.manzanaIdControl.setValue(null, { emitEvent: false });
        this.groupedLotes.set([]); // Limpiamos los planos si no hay proyecto
      }
    });
  }

  ngOnInit(): void {
   /*  // Reaccionar al cambio de proyecto global
    this._globalContext.selectedProjectId$.subscribe((projectId) => {
      if (projectId) {
        // Cuando cambia el proyecto, reseteamos el filtro de manzana y cargamos todos los lotes
        this.manzanaIdControl.setValue(null);
        this.loadLotes(null);
      } else {
        this.groupedLotes$ = of([]);
      }
    }); */

    //  Reaccionar al cambio del select de manzanas
    this.manzanaIdControl.valueChanges.subscribe((manzanaId) => {
      this.loadLotes(manzanaId);
    });
  }

  private loadLotes(manzanaId: string | null): void {
    this._lotesService.getLotes(manzanaId).pipe(
      map((lotes: ILote[]) => {
        const groups: Record<string, ILote[]> = {};
        
        lotes.forEach((lote: ILote) => {
          const key = lote.manzana?.codigo || 'S/M';
          if (!groups[key]) groups[key] = [];
          groups[key].push(lote);
        });

        return Object.keys(groups)
          .sort()
          .map(key => ({
            nombre: key,
            lotes: groups[key]
          }));
      })
    ).subscribe({
      next: (groups: IManzanaGroup[]) => {
        this.groupedLotes.set(groups); // Seteamos el valor de manera reactiva en el Signal
      },
      error: () => {
        this.groupedLotes.set([]);
      }
    });
  }

  onLoteSelected(lote: ILote): void {
    this.openDetailDrawer(lote.id);
  }

  public openDetailDrawer(loteId: string): void {
    const isMobile = this.breakpointObserver.isMatched(Breakpoints.Handset);
    if (isMobile) {
      this.modalService.open(LoteDetailComponent, {
        size: 'fullscreen', // En móvil, mejor que ocupe todo
        scrollable: true,
        windowClass: 'terraform-modal-mobile',
      }).componentInstance.loteId = loteId;
    } else {
      this.drawerService.create({
        nzContent: LoteDetailComponent,
        nzTitle: '',
        nzClosable: false,
        nzMaskClosable: true,
        nzWidth: 450,
        nzPlacement: 'right',
        nzBodyStyle: { padding: '0' },
        nzData: {
          loteId: loteId,
        },
      });
    }
  }
}