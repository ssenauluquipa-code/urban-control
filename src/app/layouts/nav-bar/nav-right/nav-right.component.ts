import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [RouterModule, NgbNavModule, NgbDropdownModule, NzIconModule],
  templateUrl: './nav-right.component.html',
  styleUrl: './nav-right.component.scss'
})
export class NavRightComponent {
  @Input() styleSelectorToggle: boolean = false;
  @Output() Customize = new EventEmitter<void>();
  windowWidth: number;
  screenFull: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.windowWidth = window.innerWidth;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get currentUser() {
    return this.authService.currentUser;
  }

   profile = [
    {
      icon: 'edit',
      title: 'Edit Profile'
    },
    {
      icon: 'user',
      title: 'View Profile'
    },
    {
      icon: 'profile',
      title: 'Social Profile'
    },
    {
      icon: 'wallet',
      title: 'Billing'
    },
    {
      icon: 'logout',
      title: 'Logout'
    }
  ];

  setting = [
    {
      icon: 'question-circle',
      title: 'Support'
    },
    {
      icon: 'user',
      title: 'Account Settings'
    },
    {
      icon: 'lock',
      title: 'Privacy Center'
    },
    {
      icon: 'comment',
      title: 'Feedback'
    },
    {
      icon: 'unordered-list',
      title: 'History'
    }
  ];


}
