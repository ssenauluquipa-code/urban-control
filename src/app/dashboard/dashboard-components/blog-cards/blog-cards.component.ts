import { Component, OnInit } from '@angular/core';
import {blogcard,blogcards} from './blog-cards-data';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-blog-cards',
    templateUrl: './blog-cards.component.html',
    standalone: true,
    imports: [NgFor]
})
export class BlogCardsComponent implements OnInit {

  blogcards:blogcard[];

  constructor() { 

    this.blogcards=blogcards;
  }

  ngOnInit(): void {
  }

}
