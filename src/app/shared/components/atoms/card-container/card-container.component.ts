import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ContentChild, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-card-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-container.component.html',
  styleUrl: './card-container.component.scss'
})
export class CardContainerComponent implements AfterContentInit{
  // Inputs
  @Input() title = '';
  @Input() icon = '';
  @Input() noPadding = false;

  // Detect footer automáticamente
  @ContentChild('[card-footer]', { static: false }) footer?: ElementRef;

  hasFooter = false;

  ngAfterContentInit(): void {
    this.hasFooter = !!this.footer;
  }
}
