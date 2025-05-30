import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgClass]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  returnUrl = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/upload'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/upload';
  }

  // Getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const email = this.f['email'].value;
    const password = this.f['password'].value;

    this.authService.signIn(email, password)
      .then(() => {
        this.router.navigate(['/upload']);
      })
      .catch(error => {
        console.error('Login error:', error);
        if (error.code === 'UserNotConfirmedException') {
          this.router.navigate(['/register'], { 
            queryParams: { 
              email: email, 
              needsConfirmation: true 
            } 
          });
        } else {
          this.errorMessage = this.getErrorMessage(error);
        }
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'UserNotFoundException':
        return 'Email not found. Please check your email or sign up.';
      case 'NotAuthorizedException':
        return 'Incorrect username or password.';
      case 'UserNotConfirmedException':
        return 'Please confirm your account first.';
      default:
        return error.message || 'An error occurred during login. Please try again.';
    }
  }

  forgotPassword(): void {
    if (this.f['email'].valid) {
      this.router.navigate(['/forgot-password'], { 
        queryParams: { email: this.f['email'].value } 
      });
    } else {
      this.router.navigate(['/forgot-password']);
    }
  }
}