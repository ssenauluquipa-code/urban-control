import { Component, inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { IAsesor } from 'src/app/core/models/asesor/asesor.model';
import { AsesorService } from 'src/app/core/services/asesor.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ITableActionEvent, TableActionsEnum } from 'src/app/shared/interfaces/table-actions.interface';
import { PageContainerComponent } from "src/app/shared/components/templates/page-container/page-container.component";
import { FormFieldComponent } from "src/app/shared/components/molecules/form-field/form-field.component";
import { InputTextComponent } from "src/app/shared/components/atoms/input-text/input-text.component";
import { DataTableComponent } from "src/app/shared/components/organisms/data-table/data-table.component";
import { ConfirmationService } from 'src/app/core/services/confirmation.service';
import { RegisterAsesorComponent } from '../register-asesor.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StatusFilterComponent } from "src/app/shared/components/atoms/status-filter/status-filter.component";
import { ActivatedRoute, Router } from '@angular/router';
import { AsesorDetailComponent } from '../asesor-detail/asesor-detail.component';

@Component({
  selector: 'app-lista-asesores',
  standalone: true,
  imports: [PageContainerComponent, FormFieldComponent, InputTextComponent, DataTableComponent, StatusFilterComponent],
  templateUrl: './lista-asesores.component.html',
  styleUrl: './lista-asesores.component.scss'
})
export class ListaAsesoresComponent implements OnInit {

  public tableActionEnum = TableActionsEnum;

  // Data
  public asesores: IAsesor[] = [];
  public loading = false;

  // Filters
  public searchControl = new FormControl('');
  public documentControl = new FormControl('');
  public filterActive: boolean | undefined = true;

  // Column Definitions
  columnDefs: ColDef[] = [
    {
      field: 'codigoAsesor',
      headerName: 'Código',
      width: 100,
      cellStyle: { fontWeight: 'bold' }
    },
    {
      field: 'nombreCompleto',
      headerName: 'Nombre Completo',
      flex: 1,
      minWidth: 200
    },
    {
      field: 'nroDocumento',
      headerName: 'Documento',
      width: 120
    },
    {
      field: 'telefono',
      headerName: 'Teléfono',
      width: 120
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250
    },
    {
      field: 'isActive',
      headerName: 'Estado',
      width: 110,
      cellRenderer: BadgeEstadoComponent
    }
  ];

  // Inyecciones
  private asesorService = inject(AsesorService);
  private confirmation = inject(ConfirmationService);
  private notification = inject(NotificationService);
  private modalService = inject(NgbModal);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadAsesores();

    // Búsqueda reactiva
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadAsesores();
    });

    this.documentControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.loadAsesores();
    });
  }

  loadAsesores(): void {
    this.loading = true;
    const term = this.searchControl.value || undefined;
    const document = this.documentControl.value || undefined;
    // Llamamos al servicio con los filtros
    this.asesorService.getAsesores(term, document, this.filterActive)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (data) => {
          this.asesores = data;
        },
        error: () => this.notification.error('Error al cargar asesores')
      });
  }

  setFilter(active: boolean | undefined): void {
    this.filterActive = active;
    this.loadAsesores();
  }

  onTableAction(event: ITableActionEvent<IAsesor>): void {
    if (event.action === TableActionsEnum.EDIT) {
      // Por ahora navegamos, luego lo cambiamos a modal si decidimos eso
      this.openModal(event.row!);
    }

    // Usamos nuestro ConfirmationService reutilizable
    if (event.action === TableActionsEnum.DEACTIVATE || event.action === TableActionsEnum.ACTIVATE) {
      const request$ = this.asesorService.toggleStatus(event.row!.id, event.row!.isActive);

      this.confirmation.toggleStatus('Asesor', event.row!.nombreCompleto, event.row!.isActive, request$)
        .subscribe(wasSuccessful => {
          if (wasSuccessful) {
            this.loadAsesores(); // Refrescamos la lista
          }
        });
    }
    if (event.action === TableActionsEnum.INFO) {
      this.openDetailModal(event.row!.id);
    }
  }

  onAddNew(): void {
    // Por ahora navega, luego será modal
    this.openModal();
  }

  private openModal(data?: IAsesor): void {
    const modalRef = this.modalService.open(RegisterAsesorComponent, { size: 'lg', centered: true });

    if (data) {
      modalRef.componentInstance.asesorData = data;
    }

    modalRef.result.then((result) => {
      if (result) {
        this.loadAsesores(); // Refresca la lista si se guardó
      }
    }).catch(() => {
      //
    });
  }

  private openDetailModal(id: string): void {
    const modalRef = this.modalService.open(AsesorDetailComponent, { size: 'lg', centered: true });
    modalRef.componentInstance.asesorId = id; // Pasamos el ID
  }
}