import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, NgIf]
})
export class HeaderComponent implements OnInit {
  isMenuCollapsed = true;
  isAuthenticated = false;
  userName = '';
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.isAuthenticated.subscribe(isAuthenticated => {
      this.isAuthenticated = isAuthenticated;
      if (isAuthenticated) {
        this.getUserName();
      } else {
        this.userName = '';
      }
    });
    
    // Force check auth status on component init
    this.authService.checkAuthStatus().then(() => {
      if (this.isAuthenticated) {
        this.getUserName();
      }
    });
  }
  
  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }
  
  async getUserName() {
    try {
      const attributes = await this.authService.getUserAttributes();
      const nameAttribute = attributes.find((attr: any) => attr.Name === 'name');
      if (nameAttribute) {
        this.userName = nameAttribute.Value;
      } else {
        // Fallback to email if name is not available
        const emailAttribute = attributes.find((attr: any) => attr.Name === 'email');
        if (emailAttribute) {
          this.userName = emailAttribute.Value;
        }
      }
    } catch (error) {
      console.error('Error getting user attributes:', error);
    }
  }
  
  logout() {
    this.authService.signOut()
      .then(() => {
        // Force update the authentication state
        this.isAuthenticated = false;
        this.userName = '';
        this.router.navigate(['/login']);
      })
      .catch(error => {
        console.error('Error signing out:', error);
      });
  }
}