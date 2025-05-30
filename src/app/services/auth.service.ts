import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Auth } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject<boolean>(false);
  private _authStatusChecked = false;
  private _currentUser: any = null;

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
      // Check if user is authenticated with Cognito
      const user = await Auth.currentAuthenticatedUser();
      this._currentUser = user;
      this._isAuthenticated.next(true);
    } catch (error) {
      this._isAuthenticated.next(false);
      this._currentUser = null;
    } finally {
      this._authStatusChecked = true;
    }
  }

  signUp(email: string, password: string, name: string): Promise<any> {
    return Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name
      }
    });
  }

  confirmSignUp(email: string, code: string): Promise<any> {
    return Auth.confirmSignUp(email, code);
  }

  resendConfirmationCode(email: string): Promise<any> {
    return Auth.resendSignUp(email);
  }

  signIn(email: string, password: string): Promise<any> {
    return Auth.signIn(email, password)
      .then(user => {
        this._currentUser = user;
        this._isAuthenticated.next(true);
        // Force a re-check of auth status to ensure everything is updated
        this._authStatusChecked = true;
        return user;
      });
  }

  signOut(): Promise<any> {
    return Auth.signOut()
      .then(() => {
        this._currentUser = null;
        this._isAuthenticated.next(false);
        // Force a re-check of auth status on next navigation
        this._authStatusChecked = false;
      });
  }

  forgotPassword(email: string): Promise<any> {
    return Auth.forgotPassword(email);
  }

  forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<any> {
    return Auth.forgotPasswordSubmit(email, code, newPassword);
  }

  changePassword(oldPassword: string, newPassword: string): Promise<any> {
    return Auth.currentAuthenticatedUser()
      .then(user => {
        return Auth.changePassword(user, oldPassword, newPassword);
      });
  }

  getCurrentUser(): Promise<any> {
    return Auth.currentAuthenticatedUser();
  }

  getUserAttributes(): Promise<any> {
    return Auth.currentAuthenticatedUser()
      .then(user => {
        return Auth.userAttributes(user);
      });
  }

  updateUserAttributes(attributes: Record<string, string>): Promise<any> {
    return Auth.currentAuthenticatedUser()
      .then(user => {
        return Auth.updateUserAttributes(user, attributes);
      });
  }
}