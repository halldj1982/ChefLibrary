import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgClass]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  confirmationForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showConfirmation = false;
  email = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });

    this.confirmationForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    // Check if user needs to confirm their account
    this.route.queryParams.subscribe(params => {
      if (params['email'] && params['needsConfirmation']) {
        this.email = params['email'];
        this.showConfirmation = true;
      }
    });
  }

  // Getter for easy access to form fields
  get f() { return this.registerForm.controls; }
  get c() { return this.confirmationForm.controls; }

  // Custom validator to check if passwords match
  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const name = this.f['name'].value;
    const email = this.f['email'].value;
    const password = this.f['password'].value;

    this.authService.signUp(email, password, name)
      .then(data => {
        console.log('Sign up successful', data);
        this.successMessage = 'Registration successful! Please check your email for a verification code.';
        this.email = email;
        this.showConfirmation = true;
      })
      .catch(error => {
        console.error('Registration error:', error);
        this.errorMessage = this.getSignUpErrorMessage(error);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  onConfirmSubmit(): void {
    if (this.confirmationForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const code = this.c['code'].value;

    this.authService.confirmSignUp(this.email, code)
      .then(() => {
        this.successMessage = 'Account confirmed successfully! You can now log in.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      })
      .catch(error => {
        console.error('Confirmation error:', error);
        this.errorMessage = this.getConfirmationErrorMessage(error);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  resendCode(): void {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resendConfirmationCode(this.email)
      .then(() => {
        this.successMessage = 'A new verification code has been sent to your email.';
      })
      .catch(error => {
        console.error('Resend code error:', error);
        this.errorMessage = 'Failed to resend verification code. Please try again.';
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  private getSignUpErrorMessage(error: any): string {
    switch (error.code) {
      case 'UsernameExistsException':
        return 'An account with this email already exists.';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements. It must include uppercase, lowercase, numbers, and special characters.';
      case 'InvalidParameterException':
        if (error.message.includes('password')) {
          return 'Password does not meet requirements. It must include uppercase, lowercase, numbers, and special characters.';
        }
        return error.message;
      default:
        return error.message || 'An error occurred during registration. Please try again.';
    }
  }

  private getConfirmationErrorMessage(error: any): string {
    switch (error.code) {
      case 'CodeMismatchException':
        return 'Invalid verification code. Please try again.';
      case 'ExpiredCodeException':
        return 'Verification code has expired. Please request a new one.';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'An error occurred during confirmation. Please try again.';
    }
  }

  backToRegister(): void {
    this.showConfirmation = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
