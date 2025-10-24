import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    console.log('🔍 [AuthInterceptor] Request URL:', req.url);
    console.log('🔍 [AuthInterceptor] Token exists:', !!token);
    console.log('🔍 [AuthInterceptor] Token value:', token?.substring(0, 20) + '...');

    let authReq = req;
    if (token && req.url.includes('/api/')) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('🔍 [AuthInterceptor] Added Authorization header');
    } else if (req.url.includes('/api/')) {
      console.log('🔍 [AuthInterceptor] No token found for API request');
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('🔍 [AuthInterceptor] Request failed:', {
          url: req.url,
          status: error.status,
          message: error.message,
          error: error.error
        });

        if (error.status === 401) {
          console.log('🔍 [AuthInterceptor] 401 error - logging out user');
          // Token expired or invalid, logout user
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
