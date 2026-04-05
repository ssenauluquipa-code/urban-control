import { Component } from '@angular/core';
import { SpinnerComponent } from './shared/spinner.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: true,
    imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent {
  title = 'app';
}
