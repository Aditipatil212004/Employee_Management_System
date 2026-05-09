import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  loginError = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard/employees']);
      return;
    }

    this.initializeForm();
  }

  /**
   * Initialize login form with validation
   */
  initializeForm(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]
    });
  }

  /**
   * Get form controls for template
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    this.submitted = true;
    this.loginError = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    // Simulate API call delay
    setTimeout(() => {
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      const success = this.authService.login(credentials);

      if (success) {
        this.router.navigate(['/dashboard/employees']);
      } else {
        this.loginError = 'Invalid email or password';
        this.loading = false;
      }
    }, 500);
  }

  /**
   * Demo login - prefill with test credentials
   */
  demoLogin(): void {
    this.loginForm.patchValue({
      email: 'demo@example.com',
      password: 'demo123'
    });
  }
}