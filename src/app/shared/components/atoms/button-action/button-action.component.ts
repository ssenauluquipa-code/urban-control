import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule, NzButtonType } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

export type ButtonSize = 'large' | 'default' | 'small';

@Component({
  selector: 'app-button-action',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule],
  templateUrl: './button-action.component.html',
  styleUrls: ['./button-action.component.scss']
})
export class ButtonActionComponent {
  @Input() nzType: NzButtonType = 'primary';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() block: boolean = false;
  @Input() ghost: boolean = false;
  @Input() size: ButtonSize = 'default';
  @Input() icon: string | null = null;

  @Output() action = new EventEmitter<MouseEvent>();

  handleAction(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.action.emit(event);
    }
  }
}


