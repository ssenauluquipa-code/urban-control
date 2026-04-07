import { Component, inject, OnInit } from '@angular/core';
import { SpinnerComponent } from './shared/spinner.component';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent implements OnInit {
  title = 'app';
  private authService = inject(AuthService);
  ngOnInit(): void {
    if(this.authService.getToken()){
      this.authService.getProfile().subscribe({
        error: () => console.error('Error al obtener el perfil'),
      })
    }
  }
}
