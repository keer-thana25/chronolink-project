import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { routes } from './app/app.routes';
import { AuthService } from './app/services/auth.service';

function authInterceptor(req: any, next: any) {
  const authService = inject(AuthService);
  const token = authService.getToken();

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

  return next(authReq);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(ReactiveFormsModule)
  ]
}).catch(err => console.error(err));
