import { Component} from '@angular/core';
import { IProduct, TopSelling } from './top-selling-data';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-top-selling',
    templateUrl: './top-selling.component.html',
    standalone: true,
    imports: [NgFor]
})
export class TopSellingComponent {

  topSelling:IProduct[];

  constructor() { 

    this.topSelling=TopSelling;
  }

}
