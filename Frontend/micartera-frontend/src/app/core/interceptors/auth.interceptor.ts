// src/app/core/interceptors/auth.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const AUTH_BYPASS = ['/auth/login', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const url = (req.url || '').toLowerCase();

  const isAuthEndpoint = AUTH_BYPASS.some((p) => url.includes(p));

  const token = !isAuthEndpoint ? localStorage.getItem('accessToken') : null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // ✅ Solo limpiar si realmente se envió token
      if (error.status === 401 && !!token) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      return throwError(() => error);
    })
  );
};
