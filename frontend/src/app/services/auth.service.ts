import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  generation: string;
  followers?: string[];
  following?: string[];
  followersCount?: number;
  followingCount?: number;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  generation: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'chronolink_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    if (token) {
      // Simple token validation - in production, verify with server
      try {
        // Basic token structure check (has 3 parts separated by dots)
        const parts = token.split('.');
        if (parts.length === 3) {
          // Just check if token exists and has valid structure
          // Don't decode payload here as it should be verified server-side
          this.currentUserSubject.next({} as User); // Will be populated by getProfile call
        } else {
          this.logout();
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSession(response);
          }
        })
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signin`, credentials)
      .pipe(
        tap(response => {
          if (response.success) {
            this.setSession(response);
          }
        })
      );
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResponse.token);
    this.currentUserSubject.next(authResponse.user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null && this.currentUserSubject.value !== null;
  }

  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/auth/profile`);
  }

  updateProfile(userData: Partial<User>): Observable<{ success: boolean; user: User }> {
    return this.http.put<{ success: boolean; user: User }>(`${this.apiUrl}/auth/profile`, userData)
      .pipe(
        tap(response => {
          if (response.success) {
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  refreshCurrentUser(): void {
    this.getProfile().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.currentUserSubject.next(response.user);
        }
      },
      error: () => {
        this.logout();
      }
    });
  }

  followUser(userId: string): Observable<{ success: boolean; message: string; following: number; followers: number }> {
    return this.http.post<{ success: boolean; message: string; following: number; followers: number }>(`${this.apiUrl}/users/${userId}/follow`, {});
  }

  unfollowUser(userId: string): Observable<{ success: boolean; message: string; following: number; followers: number }> {
    return this.http.delete<{ success: boolean; message: string; following: number; followers: number }>(`${this.apiUrl}/users/${userId}/follow`);
  }

  getUserFollowers(userId: string): Observable<{ success: boolean; followers: any[] }> {
    return this.http.get<{ success: boolean; followers: any[] }>(`${this.apiUrl}/users/${userId}/followers`);
  }

  getUserFollowing(userId: string): Observable<{ success: boolean; following: any[] }> {
    return this.http.get<{ success: boolean; following: any[] }>(`${this.apiUrl}/users/${userId}/following`);
  }
}
