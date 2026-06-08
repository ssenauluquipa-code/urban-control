import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColDef } from 'ag-grid-community';

export interface ColumnVisibilityChange {
  columnId: string;
  visible: boolean;
}

@Component({
  selector: 'app-tabla-previsualizacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tabla-previsualizacion.component.html',
  styleUrl: './tabla-previsualizacion.component.scss'
})
export class TablaPrevisualizacionComponent {
  @Input() columnDefs: ColDef[] = [];
  @Output() visibilityChange = new EventEmitter<ColumnVisibilityChange>();

  // 🌟 Estado interno para abrir/cerrar el dropdown flotante
  public isOpen = false;
  public searchText = '';

  public toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  get filteredColumns(): ColDef[] {
    return this.columnDefs.filter(col => {
      if (!col.headerName) return false;
      return col.headerName.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }

  isColumnVisible(col: ColDef): boolean {
    return col.hide !== true;
  }

  onToggleColumn(col: ColDef, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const colId = col.field || col.colId;
    
    if (colId) {
      col.hide = !checkbox.checked;
      this.visibilityChange.emit({
        columnId: colId,
        visible: checkbox.checked
      });
    }
  }
}