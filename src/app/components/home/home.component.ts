import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from '../auth/login/login.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [LoginComponent, RouterModule]
})
export class HomeComponent {
  constructor(private router: Router) {}
}