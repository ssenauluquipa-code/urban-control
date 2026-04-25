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
    const token = this.authService.getToken();
    console.log('🏁 [AppComponent] Iniciando aplicación. ¿Token presente?:', !!token);
    
    if(token){
      console.log('👤 [AppComponent] Intentando cargar perfil del usuario...');
      this.authService.getLoggedUser().subscribe({
        next: (user) => console.log('✅ [AppComponent] Perfil cargado para:', user.email),
        error: (err) => console.error('❌ [AppComponent] Error al obtener el perfil:', err),
      })
    }
  }
}
