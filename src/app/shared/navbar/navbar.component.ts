import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isAuthenticated: boolean = false;
  userEmail: string | null = null;
  menuOpen = false;
  profileOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(
      isAuth => {
        this.isAuthenticated = isAuth;
        this.userEmail = this.authService.getCurrentUserEmail();
      }
    );
  }

  logout(): void {
    this.profileOpen = false;
    this.menuOpen = false;
    this.authService.logout();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
  }

  get userInitials(): string {
    const emailPrefix = (this.userEmail || 'User').split('@')[0].replace(/[^a-zA-Z0-9]/g, '');

    if (emailPrefix.length >= 2) {
      return emailPrefix.slice(0, 2).toUpperCase();
    }

    return emailPrefix.charAt(0).toUpperCase() || 'EM';
  }
}
