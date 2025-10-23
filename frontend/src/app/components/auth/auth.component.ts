import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService, LoginRequest, RegisterRequest } from '../../services/auth.service';
import { GSAPService } from '../../services/gsap.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container min-h-screen flex items-center justify-center p-4">
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-older-generation-50 via-white to-younger-generation-50"></div>

      <!-- Auth Card -->
      <div class="auth-card relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-chronolink-primary mb-2 font-display">ChronoLink</h1>
          <p class="text-gray-600">Connecting Generations Through Stories</p>
        </div>

        <!-- Toggle Buttons -->
        <div class="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            [class.active]="!isLoginMode"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200"
            (click)="toggleMode(false)">
            Sign Up
          </button>
          <button
            type="button"
            [class.active]="isLoginMode"
            class="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200"
            (click)="toggleMode(true)">
            Login
          </button>
        </div>

        <!-- Form -->
        <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Username Field -->
          <div class="form-group">
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chronolink-primary focus:border-transparent transition-all duration-200"
              placeholder="Enter your username">
            <div *ngIf="authForm.get('username')?.invalid && authForm.get('username')?.touched" class="text-red-500 text-sm mt-1">
              Username is required
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chronolink-primary focus:border-transparent transition-all duration-200"
              placeholder="Enter your password">
            <div *ngIf="authForm.get('password')?.invalid && authForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
              Password is required (min 6 characters)
            </div>
          </div>



          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="authForm.invalid || isLoading"
            class="w-full bg-chronolink-primary text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
            <span *ngIf="isLoading" class="inline-flex items-center">
              <div class="spinner mr-2"></div>
              {{ isLoginMode ? 'Logging in...' : 'Creating account...' }}
            </span>
            <span *ngIf="!isLoading">{{ isLoginMode ? 'Login' : 'Sign Up' }}</span>
          </button>
        </form>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {{ errorMessage }}
        </div>


      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      background: linear-gradient(135deg, #fdf8f6 0%, #ffffff 50%, #f0f9ff 100%);
    }

    .auth-card {
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .toggle-button.active {
      background: white;
      color: #8B5A3C;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggle-button:not(.active) {
      color: #6b7280;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .font-display {
      font-family: 'Playfair Display', serif;
    }
  `]
})
export class AuthComponent implements OnInit, OnDestroy {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  authForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private gsapService: GSAPService
  ) {
    this.authForm = this.createForm();
  }

  ngOnInit(): void {
    this.animateEntry();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode(isLogin: boolean): void {
    this.isLoginMode = isLogin;
    this.errorMessage = '';
    this.authForm = this.createForm();

    // Animate form transition
    this.gsapService.animateFrom('.auth-card form', {
      duration: 0.3,
      opacity: 0,
      y: 20,
      ease: 'power2.out'
    });
  }

  onSubmit(): void {
    if (this.authForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.authForm.value;

    if (this.isLoginMode) {
      this.loginUser(formValue);
    } else {
      this.registerUser(formValue);
    }
  }

  private loginUser(credentials: LoginRequest): void {
    this.authService.login(credentials)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/home']);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Login failed';
        }
      });
  }

  private registerUser(userData: RegisterRequest): void {
    this.authService.register(userData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.success) {
            this.router.navigate(['/home']);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed';
        }
      });
  }

  private animateEntry(): void {
    this.gsapService.animateFrom('.auth-card', {
      duration: 0.8,
      y: 50,
      opacity: 0,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('h1', {
      duration: 0.6,
      y: -30,
      opacity: 0,
      ease: 'power2.out'
    });

    this.gsapService.animateFrom('.auth-card p', {
      duration: 0.6,
      y: 20,
      opacity: 0,
      delay: 0.2,
      ease: 'power2.out'
    });
  }
}
