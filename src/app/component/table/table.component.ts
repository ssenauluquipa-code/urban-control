import { Component } from '@angular/core';
import { IProduct, TopSelling, ITableRows, Employee } from './table-data';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-table',
  standalone: true,
  imports:[NgFor],
  templateUrl: 'table.component.html'
})
export class TableComponent {
  topSelling: IProduct[];

  trow: ITableRows[];

  constructor() {

    this.topSelling = TopSelling;

    this.trow = Employee;
  }
}
