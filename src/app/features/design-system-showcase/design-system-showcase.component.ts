import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ColDef, GridApi, ICellRendererParams } from 'ag-grid-community';
import { DataTableComponent } from 'src/app/shared/components/organisms/data-table/data-table.component';
import { PageContainerComponent } from 'src/app/shared/components/templates/page-container/page-container.component';
import { FormFieldComponent } from 'src/app/shared/components/molecules/form-field/form-field.component';
import { CurrencyLabelComponent } from 'src/app/shared/components/atoms/currency-label/currency-label.component';
import { ButtonActionComponent } from 'src/app/shared/components/atoms/button-action/button-action.component';
import { BadgeEstadoComponent } from 'src/app/shared/components/atoms/badge-estado/badge-estado.component';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';
import { InputNumberComponent } from 'src/app/shared/components/atoms/input-number/input-number.component';
import { InputTextareaComponent } from 'src/app/shared/components/atoms/input-textarea/input-textarea.component';
import { CardContainerComponent } from 'src/app/shared/components/atoms/card-container/card-container.component';
import { InputTextInfoComponent } from 'src/app/shared/components/atoms/input-text-info.component';
import { ImageDisplayComponent } from 'src/app/shared/components/atoms/image-display/image-display.component';
import { ImageUploaderComponent } from 'src/app/shared/components/atoms/image-uploader/image-uploader.component';
import { SelectDataComponent } from 'src/app/shared/components/atoms/select-data.component';
import { TEstadoLote } from 'src/app/core/models/lote/lote.model';

@Component({
  selector: 'app-design-system-showcase',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    BadgeEstadoComponent,
    ButtonActionComponent,
    CurrencyLabelComponent,
    InputTextComponent,
    InputNumberComponent,
    InputTextareaComponent,
    FormFieldComponent,
    DataTableComponent,
    PageContainerComponent,
    CardContainerComponent,
    InputTextInfoComponent,
    ImageDisplayComponent,
    ImageUploaderComponent,
    SelectDataComponent,
  ],
  templateUrl: './design-system-showcase.component.html',
  styleUrls: ['./design-system-showcase.component.scss'],
})
export class DesignSystemShowcaseComponent implements OnInit {
  // Form Controls para los inputs
  textControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);
  numberControl = new FormControl('', [Validators.required]);
  decimalControl = new FormControl('', [Validators.required]);
  textareaControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(200),
  ]);
  selectControl = new FormControl(null, [Validators.required]);

  public estado = TEstadoLote;


  gridData = [
    {
      nroLote: 'L-001',
      manzana: 'M-1',
      cliente: 'Juan Perez',
      estado: 'DISPONIBLE',
      precio: 50000,
    },
    {
      nroLote: 'L-002',
      manzana: 'M-1',
      cliente: 'Maria Garcia',
      estado: 'VENDIDO',
      precio: 55000,
    },
    {
      nroLote: 'L-003',
      manzana: 'M-2',
      cliente: 'Carlos Lopez',
      estado: 'RESERVADO',
      precio: 48000,
    },
    {
      nroLote: 'L-004',
      manzana: 'M-2',
      cliente: 'Ana Rodriguez',
      estado: 'DISPONIBLE',
      precio: 52000,
    },
    {
      nroLote: 'L-005',
      manzana: 'M-3',
      cliente: 'Luis Fernandez',
      estado: 'VENDIDO',
      precio: 60000,
    },
  ];

  gridColumns: ColDef[] = [
    { field: 'nroLote', headerName: 'Nro. Lote', width: 100 },
    { field: 'manzana', headerName: 'Manzana', width: 100 },
    { field: 'cliente', headerName: 'Cliente', flex: 1 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      cellRenderer: BadgeEstadoComponent,
      cellRendererParams: (params: ICellRendererParams) => ({
        estado: params.value
      })
    },
    {
      field: 'precio',
      headerName: 'Precio',
      width: 120,
      valueFormatter: (params: { value: number }) => {
        return 'BS ' + params.value.toLocaleString();
      },
    },
  ];

  sampleProjects = [
    { Id: 1, Name: 'Urbanización Los Pinos' },
    { Id: 2, Name: 'Condominio El Prado' },
    { Id: 3, Name: 'Residencial Santa Cruz' }
  ];

  sampleImageUrl = 'https://picsum.photos/400/400';

  ngOnInit(): void {
    this.textControl.valueChanges.subscribe((value) => {
      console.log('Text control:', value);
    });
  }

  onClick(event: MouseEvent): void {
    console.log('Botón clickeado:', event);
  }

  onSearchCliente(term: string): void {
    console.log('Buscando cliente:', term);
  }

  onGridReady(api: GridApi): void {
    console.log('Grid listo:', api);
  }

  onHeaderBack(): void {
    console.log('Back clicked');
  }

  onHeaderNew(): void {
    console.log('New clicked');
  }

  onHeaderExportExcel(): void {
    console.log('Export: EXCEL');
  }

  onHeaderExportPdf(): void {
    console.log('Export: PDF');
  }
}
