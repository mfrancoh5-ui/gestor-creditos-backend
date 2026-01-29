import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Credito, ApiResponse, PaginatedResponse } from '../models';

export interface CrearCreditoDto {
  clienteId: number;
  monto: number;
  tasaInteres: number;
  plazoMeses: number;
  plan: string;
}

export interface CreditoBalance {
  id: number;
  clienteId: number;
  saldoPendiente: number;
  cuotasRestantes: number;
  proximoVencimiento?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreditosService {
  constructor(private apiService: ApiService) {}

  /** Normaliza paginación sin romper el contrato del frontend */
  private buildPaging(page: number, pageSize: number) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 10;

    return {
      page: safePage,
      limit: safeSize,     // ✅ backend-friendly
      pageSize: safeSize,  // ✅ backward-compatible si el backend sí lo usa
    };
  }

  listarCreditos(
    page: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<PaginatedResponse<Credito>>> {
    return this.apiService.get<ApiResponse<PaginatedResponse<Credito>>>(
      '/creditos',
      this.buildPaging(page, pageSize)
    );
  }

  obtenerCredito(id: number): Observable<ApiResponse<Credito>> {
    return this.apiService.get<ApiResponse<Credito>>(`/creditos/${id}`);
  }

  crearCredito(dto: CrearCreditoDto): Observable<ApiResponse<Credito>> {
    return this.apiService.post<ApiResponse<Credito>>('/creditos', dto);
  }

  crearCreditoPlanA(dto: CrearCreditoDto): Observable<ApiResponse<any>> {
    return this.apiService.post<ApiResponse<any>>('/creditos/plan-a', dto);
  }

  listarCreditosPorCliente(
    clienteId: number,
    page: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<PaginatedResponse<Credito>>> {
    return this.apiService.get<ApiResponse<PaginatedResponse<Credito>>>(
      `/creditos/cliente/${clienteId}`,
      { clienteId, ...this.buildPaging(page, pageSize) }
    );
  }

  obtenerBalance(creditoId: number): Observable<ApiResponse<CreditoBalance>> {
    return this.apiService.get<ApiResponse<CreditoBalance>>(
      `/creditos/${creditoId}/balance`
    );
  }

  calcularCuota(
    monto: number,
    tasaInteres: number,
    plazoMeses: number
  ): Observable<ApiResponse<{ cuotaMensual: number }>> {
    return this.apiService.get<ApiResponse<{ cuotaMensual: number }>>(
      '/creditos/calcular-cuota',
      { monto, tasaInteres, plazoMeses }
    );
  }
}
