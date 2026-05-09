import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginCredentials } from '../models/employee.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuth());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {}

  /**
   * Login user with email and password
   * Simple authentication stored in localStorage
   */
  login(credentials: LoginCredentials): boolean {
    // Simple validation - in real app, this would call a backend API
    if (credentials.email && credentials.password) {
      localStorage.setItem('authToken', 'token_' + Date.now());
      localStorage.setItem('userEmail', credentials.email);
      this.isAuthenticatedSubject.next(true);
      return true;
    }
    return false;
  }

  /**
   * Logout user and clear authentication
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.checkAuth();
  }

  /**
   * Get current user email
   */
  getCurrentUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  /**
   * Private method to check authentication status
   */
  private checkAuth(): boolean {
    return !!localStorage.getItem('authToken');
  }
}