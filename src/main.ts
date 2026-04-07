import '@angular/localize/init';

import { AppComponent } from './app/app.component';
import { Approutes } from './app/app-routing.module';
import { provideRouter } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { LocationStrategy, PathLocationStrategy, CommonModule } from '@angular/common';

// AG Grid - Register Community Modules
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { ProyectoRepository } from './app/core/repository/proyectos/proyecto.repository';
import { UserRepository } from './app/core/repository/user.repository';
import { USER_REPOSITORY_TOKEN } from './app/core/services/user.service';


ModuleRegistry.registerModules([AllCommunityModule]);

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(CommonModule, BrowserModule, FormsModule, ReactiveFormsModule, NgbModule),
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy
        },
        { provide: NZ_I18N, useValue: en_US },
        // 🔑 REGISTRO DEL REPOSITORIO PARA DIP
        {
            provide: 'IProyectoRepository',
            useClass: ProyectoRepository
        },
        {
            provide: USER_REPOSITORY_TOKEN,
            useClass: UserRepository
        },
        provideAnimationsAsync(),
        importProvidersFrom(NzIconModule),
        provideAnimations(),
        provideHttpClient(withInterceptors([authInterceptor]), withInterceptorsFromDi()),
        provideRouter(Approutes)
    ]
})
  .catch(err => console.error(err));
