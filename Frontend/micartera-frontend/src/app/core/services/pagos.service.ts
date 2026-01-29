import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError } from 'rxjs';
import { Pago, ApiResponse, PaginatedResponse } from '../models';

export interface CrearPagoDto {
  creditoId: number;
  monto: number;
  fecha: string; // ISO yyyy-mm-dd o ISO string
  tipo: string;  // ej: "EFECTIVO", "TRANSFERENCIA", etc.
}

@Injectable({
  providedIn: 'root',
})
export class PagosService {
  constructor(private apiService: ApiService) {}

  /** Normaliza paginación sin romper el contrato del frontend */
  private buildPaging(page: number, pageSize: number) {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeSize =
      Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100 ? pageSize : 10;

    return {
      page: safePage,
      limit: safeSize,     // ✅ backend-friendly
      pageSize: safeSize,  // ✅ backward-compatible
    };
  }

  listarPagos(
    page: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<PaginatedResponse<Pago>>> {
    return this.apiService.get<ApiResponse<PaginatedResponse<Pago>>>(
      '/pagos',
      this.buildPaging(page, pageSize)
    );
  }

  obtenerPago(id: number): Observable<ApiResponse<Pago>> {
    return this.apiService.get<ApiResponse<Pago>>(`/pagos/${id}`);
  }

  /** Endpoint estándar (si existe en backend) */
  crearPago(dto: CrearPagoDto): Observable<ApiResponse<Pago>> {
    return this.apiService.post<ApiResponse<Pago>>('/pagos', dto);
  }

  listarPagosPorCredito(
    creditoId: number,
    page: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<PaginatedResponse<Pago>>> {
    return this.apiService.get<ApiResponse<PaginatedResponse<Pago>>>(
      `/pagos/credito/${creditoId}`,
      { creditoId, ...this.buildPaging(page, pageSize) }
    );
  }

  /**
   * ✅ Fail-safe:
   * 1) intenta /pagos/registrar
   * 2) si no existe (404), cae a /pagos
   */
  registrarPago(dto: CrearPagoDto): Observable<ApiResponse<Pago>> {
    return this.apiService.post<ApiResponse<Pago>>('/pagos/registrar', dto).pipe(
      catchError((err: any) => {
        if (err?.status === 404) {
          return this.apiService.post<ApiResponse<Pago>>('/pagos', dto);
        }
        throw err;
      })
    );
  }

  obtenerHistorialPagos(clienteId: number): Observable<ApiResponse<Pago[]>> {
    return this.apiService.get<ApiResponse<Pago[]>>(`/pagos/historial/${clienteId}`);
  }
}
