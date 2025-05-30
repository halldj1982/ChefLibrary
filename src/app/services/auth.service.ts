import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

// Using any type to avoid TypeScript errors with AWS Amplify
declare const AWS: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _authStatusChecked = false;

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  get isAuthenticated(): Observable<boolean> {
    if (!this._authStatusChecked) {
      return from(this.checkAuthStatus()).pipe(
        map(() => this._isAuthenticated.value)
      );
    }
    return this._isAuthenticated.asObservable();
  }

  async checkAuthStatus(): Promise<void> {
    try {
      // Using any type to avoid TypeScript errors
      const auth = (window as any).AWS?.Cognito?.Auth || (window as any).AWS?.Auth;
      if (auth) {
        await auth.currentAuthenticatedUser();
        this._isAuthenticated.next(true);
      } else {
        this._isAuthenticated.next(false);
      }
    } catch (error) {
      this._isAuthenticated.next(false);
    } finally {
      this._authStatusChecked = true;
    }
  }

  // Helper method to get Auth module
  private getAuth(): any {
    return (window as any).AWS?.Cognito?.Auth || (window as any).AWS?.Auth;
  }

  signUp(email: string, password: string, name: string): Promise<any> {
    const auth = this.getAuth();
    return auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name
      }
    });
  }

  confirmSignUp(email: string, code: string): Promise<any> {
    const auth = this.getAuth();
    return auth.confirmSignUp(email, code);
  }

  resendConfirmationCode(email: string): Promise<any> {
    const auth = this.getAuth();
    return auth.resendSignUp(email);
  }

  signIn(email: string, password: string): Promise<any> {
    const auth = this.getAuth();
    return auth.signIn(email, password)
      .then((user: any) => {
        this._isAuthenticated.next(true);
        return user;
      });
  }

  signOut(): Promise<any> {
    const auth = this.getAuth();
    return auth.signOut()
      .then(() => {
        this._isAuthenticated.next(false);
      });
  }

  forgotPassword(email: string): Promise<any> {
    const auth = this.getAuth();
    return auth.forgotPassword(email);
  }

  forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<any> {
    const auth = this.getAuth();
    return auth.forgotPasswordSubmit(email, code, newPassword);
  }

  changePassword(oldPassword: string, newPassword: string): Promise<any> {
    const auth = this.getAuth();
    return auth.currentAuthenticatedUser()
      .then((user: any) => {
        return auth.changePassword(user, oldPassword, newPassword);
      });
  }

  getCurrentUser(): Promise<any> {
    const auth = this.getAuth();
    return auth.currentAuthenticatedUser();
  }

  getUserAttributes(): Promise<any> {
    const auth = this.getAuth();
    return auth.currentAuthenticatedUser()
      .then((user: any) => {
        return auth.userAttributes(user);
      });
  }

  updateUserAttributes(attributes: Record<string, string>): Promise<any> {
    const auth = this.getAuth();
    return auth.currentAuthenticatedUser()
      .then((user: any) => {
        return auth.updateUserAttributes(user, attributes);
      });
  }
}
