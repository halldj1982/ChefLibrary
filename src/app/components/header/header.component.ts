import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass]
})
export class HeaderComponent {
  isMenuCollapsed = true;
  
  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }
}