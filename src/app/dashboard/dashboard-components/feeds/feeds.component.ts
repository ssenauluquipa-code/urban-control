import { Component, OnInit } from '@angular/core';
import { Feeds,Feed } from './feeds-data';
import { NgFor } from '@angular/common';

@Component({
    selector: 'app-feeds',
    templateUrl: './feeds.component.html',
    standalone: true,
    imports: [NgFor]
})
export class FeedsComponent implements OnInit {

  feeds:Feed[];

  constructor() {

    this.feeds = Feeds;
  }

  ngOnInit(): void {
  }

}
