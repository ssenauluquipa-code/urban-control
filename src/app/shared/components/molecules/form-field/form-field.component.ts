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
  @Input() label = '';
  @Input() forId = '';
  @Input() required = false;
  @Input() noColon = false;
  @Input() errorTip = '';
  @Input() layout: FormLayout = 'vertical';
}
