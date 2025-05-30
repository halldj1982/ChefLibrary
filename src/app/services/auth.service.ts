import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

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
      // Check if there's a user in localStorage
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        this._currentUser = JSON.parse(userJson);
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

  signUp(email: string, password: string, name: string): Promise<any> {
    // Mock sign up functionality
    return new Promise((resolve) => {
      // In a real implementation, this would call Cognito
      const user = {
        username: email,
        attributes: {
          email,
          name
        }
      };
      
      setTimeout(() => {
        resolve({ user });
      }, 500);
    });
  }

  confirmSignUp(email: string, code: string): Promise<any> {
    // Mock confirm sign up functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  resendConfirmationCode(email: string): Promise<any> {
    // Mock resend confirmation code functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  signIn(email: string, password: string): Promise<any> {
    // Mock sign in functionality
    return new Promise((resolve, reject) => {
      // In a real implementation, this would call Cognito
      if (email && password) {
        const user = {
          username: email,
          attributes: {
            email,
            name: 'User'
          }
        };
        
        this._currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this._isAuthenticated.next(true);
        
        setTimeout(() => {
          resolve(user);
        }, 500);
      } else {
        reject(new Error('Invalid credentials'));
      }
    });
  }

  signOut(): Promise<any> {
    // Mock sign out functionality
    return new Promise((resolve) => {
      this._currentUser = null;
      localStorage.removeItem('currentUser');
      this._isAuthenticated.next(false);
      
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  forgotPassword(email: string): Promise<any> {
    // Mock forgot password functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  forgotPasswordSubmit(email: string, code: string, newPassword: string): Promise<any> {
    // Mock forgot password submit functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  changePassword(oldPassword: string, newPassword: string): Promise<any> {
    // Mock change password functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  getCurrentUser(): Promise<any> {
    // Mock get current user functionality
    return new Promise((resolve, reject) => {
      if (this._currentUser) {
        resolve(this._currentUser);
      } else {
        reject(new Error('No current user'));
      }
    });
  }

  getUserAttributes(): Promise<any> {
    // Mock get user attributes functionality
    return new Promise((resolve, reject) => {
      if (this._currentUser) {
        resolve(this._currentUser.attributes);
      } else {
        reject(new Error('No current user'));
      }
    });
  }

  updateUserAttributes(attributes: Record<string, string>): Promise<any> {
    // Mock update user attributes functionality
    return new Promise((resolve) => {
      if (this._currentUser) {
        this._currentUser.attributes = {
          ...this._currentUser.attributes,
          ...attributes
        };
        localStorage.setItem('currentUser', JSON.stringify(this._currentUser));
      }
      
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }
}
