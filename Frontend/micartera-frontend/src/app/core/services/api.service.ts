import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    // Normaliza: sin slash final
    this.apiUrl = (environment.apiUrl || '').replace(/\/+$/, '');
  }

  private buildUrl(endpoint: string): string {
    // Acepta '/auth/login' o 'auth/login'
    const ep = (endpoint || '').trim();
    const normalized = ep.startsWith('/') ? ep : `/${ep}`;
    return `${this.apiUrl}${normalized}`;
  }

  /**
   * ✅ NO hacer "traducciones mágicas" (pageSize -> limit)
   * Su backend ya trabaja con page/pageSize según su service.
   * Aquí solo serializamos params de forma limpia.
   */
  private buildParams(params?: Record<string, any>): HttpParams | undefined {
    if (!params) return undefined;

    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;

      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v === null || v === undefined || v === '') return;
          httpParams = httpParams.append(key, String(v));
        });
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), {
      params: this.buildParams(params),
    });
  }

  post<T>(endpoint: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body ?? {}, {
      params: this.buildParams(params),
    });
  }

  put<T>(endpoint: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body ?? {}, {
      params: this.buildParams(params),
    });
  }

  patch<T>(endpoint: string, body?: any, params?: Record<string, any>): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body ?? {}, {
      params: this.buildParams(params),
    });
  }

  delete<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), {
      params: this.buildParams(params),
    });
  }
}
