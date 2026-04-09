import { Routes } from "@angular/router";
import { ProfileEditPageComponent } from "./pages/profile-edit-page/profile-edit-page.component";

export const PROFILE_ROUTES: Routes = [
    {
        path: 'edit', // Esto se convierte en /profile/edit si lo cargas como 'profile' en el app.routes
        component: ProfileEditPageComponent
    }
]