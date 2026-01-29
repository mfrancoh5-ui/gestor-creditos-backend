import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Credito } from '../models/credito.model';

// ==============================
// Respuesta paginada estándar
// ==============================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class CreditosService {
  private readonly apiUrl = `${environment.apiUrl}/creditos`;

  constructor(private http: HttpClient) {}

  // ==============================
  // Listar créditos paginados
  // GET /api/creditos?page=1&pageSize=10
  // ==============================
  listar(
    page: number = 1,
    pageSize: number = 10
  ): Observable<PaginatedResponse<Credito>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http.get<PaginatedResponse<Credito>>(this.apiUrl, { params });
  }

  // ==============================
  // Crear crédito Plan A
  // POST /api/creditos/plan-a
  // ==============================
  crearPlanA(payload: {
    clienteId: number;
    montoPrestado: number | string;
    cuotaFija: number | string;
    numeroCuotas: number;
    fechaInicio: string;
    frecuencia: 'DAILY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';
  }): Observable<Credito> {
    return this.http.post<Credito>(`${this.apiUrl}/plan-a`, payload);
  }
}
