import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ILoginDto } from 'src/app/core/models/auth.model';
import { InputTextComponent } from 'src/app/shared/components/atoms/input-text/input-text.component';

@Component({
  selector: 'app-view-login',
  standalone: true,
  imports: [InputTextComponent, RouterLink, CommonModule],
  templateUrl: './view-login.component.html',
  styleUrl: './view-login.component.scss',
})
export class ViewLoginComponent {
  @Input() loginGroup: FormGroup = new FormGroup({});
  @Output() login = new EventEmitter<ILoginDto>();
  @Input() isLogin = false;

  submit() {
    if (this.loginGroup.valid) {
      this.login.emit(this.loginGroup.value);
    } else {
      this.loginGroup.markAllAsTouched();
    }
  }

  get email(): FormControl {
    return this.loginGroup.get('email') as FormControl ?? new FormControl();
  }

  get password(): FormControl {
    return this.loginGroup.get('password') as FormControl ?? new FormControl();
  }
}
