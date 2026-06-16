import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IFloatingFilterAngularComp } from "ag-grid-angular";
import { IFloatingFilterParams, TextFilterModel } from "ag-grid-community";
import { TEstadoLote } from "src/app/core/models/lote/lote.model";

@Component({
  selector: "app-lote-status-floating-filter",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="custom-floating-filter">
      <select
        class="ag-custom-select"
        [(ngModel)]="currentValue"
        (change)="onValueChange()"
      >
        <option value="all">Todos</option>
        <option [value]="TEstadoLote.DISPONIBLE">Disponible</option>
        <option [value]="TEstadoLote.RESERVADO">Reservado</option>
        <option [value]="TEstadoLote.VENDIDO">Vendido</option>
        <option [value]="TEstadoLote.BLOQUEADO">Bloqueado</option>
      </select>
    </div>
  `,
  styles: [
    `
      .custom-floating-filter {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
      }

      .ag-custom-select {
        width: 100%;
        height: 30px;
        font-size: var(--ag-font-size, 13px);
        color: var(--ag-data-color, #181d1f);
        background-color: var(--ag-background-color, #fff);
        border: 1px solid var(--ag-border-color, #babfc7);
        border-radius: var(--ag-border-radius, 4px);
        padding: 0 8px;
        outline: none;
        cursor: pointer;
        appearance: auto;
        transition:
          border-color 0.15s ease-in-out,
          box-shadow 0.15s ease-in-out;
      }

      .ag-custom-select:focus {
        border-color: var(--ag-input-focus-border-color, #007bff);
        box-shadow: var(
          --ag-input-focus-box-shadow,
          0 0 0 0.2rem rgba(0, 123, 255, 0.25)
        );
      }
    `,
  ],
})
export class LoteStatusFloatingFilterComponent implements IFloatingFilterAngularComp {
  protected readonly TEstadoLote = TEstadoLote;

  params!: IFloatingFilterParams<unknown, TextFilterModel>;
  currentValue = "all";

  agInit(params: IFloatingFilterParams<unknown, TextFilterModel>): void {
    this.params = params;
  }

  onParentModelChanged(parentModel: TextFilterModel | null): void {
    this.currentValue = parentModel?.filter ?? "all";
  }

  onValueChange(): void {
    const model: TextFilterModel | null =
      this.currentValue === "all"
        ? null
        : {
            filterType: "text",
            type: "equals",
            filter: this.currentValue,
          };

    this.params.parentFilterInstance((instance: unknown) => {
      const textFilter = instance as {
        setModel: (model: TextFilterModel | null) => void;
      };
      textFilter.setModel(model);
      this.params.api.onFilterChanged();
    });
  }
}
