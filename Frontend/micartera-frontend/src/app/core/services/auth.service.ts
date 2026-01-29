import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { Usuario } from '../models';

/**
 * Compatibilidad backend:
 * - Login puede devolver:
 *   A) { accessToken: string, refreshToken?: string, user?: Usuario }
 *   B) { data: { accessToken, refreshToken?, user? } }
 *   C) { access_token: string, refresh_token?: string, user?: Usuario }
 */
export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user?: Usuario;

  access_token?: string;
  refresh_token?: string;

  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: Usuario;

    access_token?: string;
    refresh_token?: string;
  };
}

export interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;

  // por si el backend usa snake_case
  access_token?: string;
  refresh_token?: string;

  data?: {
    accessToken?: string;
    refreshToken?: string;
    access_token?: string;
    refresh_token?: string;
  };
}

// ✅ Keys ÚNICAS (mismo nombre en toda la app)
const LS_ACCESS = 'accessToken';
const LS_REFRESH = 'refreshToken';
const LS_USER = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userRaw = localStorage.getItem(LS_USER);
    const token = localStorage.getItem(LS_ACCESS);

    // Si hay token, ya estamos “autenticados” a nivel API (aunque falte user)
    if (token) this.isAuthenticatedSubject.next(true);

    if (userRaw) {
      try {
        const parsedUser: Usuario = JSON.parse(userRaw);
        this.currentUserSubject.next(parsedUser);
      } catch {
        this.hardClearSession();
      }
    }
  }

  private hardClearSession(): void {
    localStorage.removeItem(LS_ACCESS);
    localStorage.removeItem(LS_REFRESH);
    localStorage.removeItem(LS_USER);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private saveSession(accessToken: string, user?: Usuario, refreshToken?: string): void {
    if (accessToken) localStorage.setItem(LS_ACCESS, accessToken);

    if (refreshToken) localStorage.setItem(LS_REFRESH, refreshToken);

    if (user) {
      localStorage.setItem(LS_USER, JSON.stringify(user));
      this.currentUserSubject.next(user);
    }

    // Con token ya se considera autenticado para las llamadas protegidas
    this.isAuthenticatedSubject.next(!!accessToken);
  }

  private extractTokens(res: LoginResponse): { accessToken: string; refreshToken?: string; user?: Usuario } {
    const accessToken =
      res?.accessToken ??
      res?.data?.accessToken ??
      res?.access_token ??
      res?.data?.access_token;

    const refreshToken =
      res?.refreshToken ??
      res?.data?.refreshToken ??
      res?.refresh_token ??
      res?.data?.refresh_token;

    const user = res?.user ?? res?.data?.user;

    if (!accessToken) {
      throw new Error('Respuesta inválida del servidor: falta accessToken.');
    }

    return { accessToken, refreshToken, user };
  }

  private extractUser(anyRes: any): Usuario {
    // soporta: {user}, {data}, o directo Usuario
    return (anyRes?.user ?? anyRes?.data ?? anyRes) as Usuario;
  }

  /**
   * ✅ LOGIN robusto (orden correcto):
   * 1) POST /auth/login
   * 2) Guardar accessToken (y refresh si viene)
   * 3) Si no vino user -> GET /auth/me (ya con Authorization)
   */
  login(email: string, password: string): Observable<{ accessToken: string; user: Usuario }> {
    const payload = {
      email: (email ?? '').trim(),
      password: (password ?? '').trim(),
    };

    return this.apiService.post<LoginResponse>('/auth/login', payload).pipe(
      switchMap((res) => {
        let tokens: { accessToken: string; refreshToken?: string; user?: Usuario };

        try {
          tokens = this.extractTokens(res);
        } catch (e) {
          this.hardClearSession();
          return throwError(() => e);
        }

        // 1) Guardar token ANTES de /me (clave para que interceptor lo ponga)
        this.saveSession(tokens.accessToken, tokens.user, tokens.refreshToken);

        // 2) Si ya vino user, listo
        if (tokens.user) {
          return of({ accessToken: tokens.accessToken, user: tokens.user });
        }

        // 3) Si NO vino user, pedir /me ya con Authorization
        return this.me().pipe(
          map((user) => ({ accessToken: tokens.accessToken, user })),
          tap(({ user }) => {
            // Guardar user real
            this.saveSession(tokens.accessToken, user, tokens.refreshToken);
          })
        );
      }),
      catchError((err) => {
        // si falla login o /me, limpiar sesión
        this.hardClearSession();
        return throwError(() => err);
      })
    );
  }

  /**
   * ✅ Usuario autenticado (requiere Authorization: Bearer)
   */
  me(): Observable<Usuario> {
    return this.apiService.get<any>('/auth/me').pipe(
      map((res) => this.extractUser(res)),
      tap((user) => {
        localStorage.setItem(LS_USER, JSON.stringify(user));
        this.currentUserSubject.next(user);
        // Mantener true si hay token
        this.isAuthenticatedSubject.next(!!localStorage.getItem(LS_ACCESS));
      })
    );
  }

  logout(): void {
    this.hardClearSession();
  }

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * ✅ Autenticado si hay accessToken (no dependa del user, porque /me puede tardar)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(LS_ACCESS);
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return !!user && user.rol === role;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return !!user && roles.includes(user.rol);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(LS_ACCESS);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(LS_REFRESH);
  }

  /**
   * ✅ Refresh tolerante:
   * manda refreshToken en camelCase y snake_case
   * acepta accessToken camel y snake
   */
  refreshToken(refreshToken: string): Observable<RefreshResponse> {
    const body = { refreshToken, refresh_token: refreshToken };

    return this.apiService.post<RefreshResponse>('/auth/refresh', body).pipe(
      tap((res) => {
        const newAccess =
          res?.accessToken ?? res?.data?.accessToken ?? res?.access_token ?? res?.data?.access_token;

        const newRefresh =
          res?.refreshToken ?? res?.data?.refreshToken ?? res?.refresh_token ?? res?.data?.refresh_token;

        if (newAccess) localStorage.setItem(LS_ACCESS, newAccess);
        if (newRefresh) localStorage.setItem(LS_REFRESH, newRefresh);

        this.isAuthenticatedSubject.next(!!localStorage.getItem(LS_ACCESS));
      }),
      catchError((err) => {
        // si refresh falla, cortar sesión (opcional, pero recomendado)
        this.hardClearSession();
        return throwError(() => err);
      })
    );
  }
}
