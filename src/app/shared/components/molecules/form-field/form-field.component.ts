import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';

export type FormLayout = 'horizontal' | 'vertical' | 'inline';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, NzFormModule],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent {
  @Input() label: string = '';
  @Input() forId: string = '';
  @Input() required: boolean = false;
  @Input() noColon: boolean = false;
  @Input() errorTip: string = '';
  @Input() layout: FormLayout = 'vertical';

  get containerClass(): string {
    return this.layout;
  }
}
