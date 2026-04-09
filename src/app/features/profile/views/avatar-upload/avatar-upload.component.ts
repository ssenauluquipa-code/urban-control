import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [NzIconModule],
  template: `
    <div class="text-center mb-4">
      <div class="position-relative d-inline-block">
        <img [src]="previewUrl() || currentImage || '../../../../assets/images/user/avatar-2.jpg'"
             class="rounded-circle border" style="width: 120px; height: 120px; object-fit: cover;" alt="Avatar">

        <button type="button" class="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle"
                (click)="fileInput.click()">
          <span nz-icon nzType="camera"></span>
        </button>
        <input type="file" #fileInput class="d-none" (change)="onFileChange($event)" accept="image/*">
      </div>
    </div>
  `,
  styles: ``
})
export class AvatarUploadComponent {

  @Input() currentImage: string | null = null;
  @Output() imageChanged = new EventEmitter<File>();
  previewUrl = signal<string | null>(null);

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
      this.imageChanged.emit(file);
    }
  }
}
