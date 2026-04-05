import { Component } from '@angular/core';
import {ITopcard,topcards} from './top-cards-data';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-top-cards',
    templateUrl: './top-cards.component.html',
    standalone: true,
    imports: [NgFor]
})
export class TopCardsComponent {

  topcards:ITopcard[];

  constructor() { 

    this.topcards=topcards;
  }



}
