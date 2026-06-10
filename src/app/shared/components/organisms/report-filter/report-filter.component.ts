import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ColumnVisibilityChange, TablaPrevisualizacionComponent } from 'src/app/features/module_reportes/components/tabla-previsualizacion/tabla-previsualizacion.component';


@Component({
  selector: 'app-report-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TablaPrevisualizacionComponent],
  templateUrl: './report-filter.component.html',
  styleUrl: './report-filter.component.scss' // 🎨 El ÚNICO SCSS con el flexbox elástico
})
export class ReportFilterComponent {
  @Input({ required: true }) formGroup!: FormGroup;
  @Input({ required: true }) columnDefs: ColDef[] = [];
  @Input() mostrarBtnLimpiar: boolean = false;

  @Output() onLimpiar = new EventEmitter<void>();
  @Output() visibilidadColumnaChange = new EventEmitter<ColumnVisibilityChange>();

  public onVisibilityChange(event: ColumnVisibilityChange): void {
    this.visibilidadColumnaChange.emit(event);
  }
}