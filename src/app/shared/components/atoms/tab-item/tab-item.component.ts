import { Component, Input, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-tab-item',
  standalone: true,
  template: `
    <ng-template #itemTemplate>
      <ng-content></ng-content>
    </ng-template>
  `
})
export class TabItemComponent {
  @Input() title = '';
  @Input() icon?: string;
  @Input() badge?: number;
  @Input() disabled = false;

  @ViewChild('itemTemplate', { static: true })
  templateRef!: TemplateRef<any>;
}
