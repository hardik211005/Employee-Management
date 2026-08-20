import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  currentUser$;
  isDarkMode = false;

  constructor(private authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;

    const savedTheme = localStorage.getItem('dashboard-theme');
    this.isDarkMode = savedTheme === 'dark';

    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;

    document.documentElement.classList.toggle('dark-theme', this.isDarkMode);
    localStorage.setItem('dashboard-theme', this.isDarkMode ? 'dark' : 'light');

    window.dispatchEvent(
      new CustomEvent('dashboard-theme-change', {
        detail: { dark: this.isDarkMode }
      })
    );
  }

  onLogout(): void {
    this.authService.logout();
  }
}
