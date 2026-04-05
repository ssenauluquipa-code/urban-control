import { Injectable, inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private message = inject(NzMessageService);

  success(text: string): void {
    this.message.success(text, { nzDuration: 3000 });
  }

  error(text: string): void {
    this.message.error(text, { nzDuration: 5000 });
  }

  info(text: string): void {
    this.message.info(text);
  }

  warning(text: string): void {
    this.message.warning(text);
  }
}
