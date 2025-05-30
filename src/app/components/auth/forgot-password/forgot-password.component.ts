import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgClass]
})
export class ForgotPasswordComponent implements OnInit {
  requestForm: FormGroup;
  resetForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showResetForm = false;
  email = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.requestForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.formBuilder.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.mustMatch('newPassword', 'confirmPassword')
    });
  }

  ngOnInit(): void {
    // Check if email was provided in query params
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.requestForm.patchValue({ email: params['email'] });
      }
    });
  }

  // Getter for easy access to form fields
  get f() { return this.requestForm.controls; }
  get r() { return this.resetForm.controls; }

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

  onRequestSubmit(): void {
    if (this.requestForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.email = this.f['email'].value;

    this.authService.forgotPassword(this.email)
      .then(() => {
        this.successMessage = 'Password reset code has been sent to your email.';
        this.showResetForm = true;
      })
      .catch(error => {
        console.error('Forgot password error:', error);
        this.errorMessage = this.getErrorMessage(error);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  onResetSubmit(): void {
    if (this.resetForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const code = this.r['code'].value;
    const newPassword = this.r['newPassword'].value;

    this.authService.forgotPasswordSubmit(this.email, code, newPassword)
      .then(() => {
        this.successMessage = 'Your password has been reset successfully!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      })
      .catch(error => {
        console.error('Reset password error:', error);
        this.errorMessage = this.getErrorMessage(error);
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  private getErrorMessage(error: any): string {
    switch (error.code) {
      case 'UserNotFoundException':
        return 'Email not found. Please check your email or sign up.';
      case 'InvalidParameterException':
        if (error.message.includes('password')) {
          return 'Password does not meet requirements. It must include uppercase, lowercase, numbers, and special characters.';
        }
        return error.message;
      case 'CodeMismatchException':
        return 'Invalid verification code. Please try again.';
      case 'ExpiredCodeException':
        return 'Verification code has expired. Please request a new one.';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }

  backToRequest(): void {
    this.showResetForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
