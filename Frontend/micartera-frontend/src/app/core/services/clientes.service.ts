import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Cliente, ApiResponse, PaginatedResponse } from '../models';

export interface CrearClienteDto {
  nombres: string;
  apellidos: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
}

export type ActualizarClienteDto = Partial<CrearClienteDto>;

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private apiService: ApiService) {}

  listarClientes(
    page: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<PaginatedResponse<Cliente>>> {
    // ✅ Envíe exactamente lo que el backend entiende
    // (si el backend usa pageSize, mande pageSize; si usa limit, mande limit)
    return this.apiService.get<ApiResponse<PaginatedResponse<Cliente>>>('/clientes', {
      page,
      pageSize,
    });
  }

  obtenerCliente(id: number): Observable<ApiResponse<Cliente>> {
    return this.apiService.get<ApiResponse<Cliente>>(`/clientes/${id}`);
  }

  crearCliente(dto: CrearClienteDto): Observable<ApiResponse<Cliente>> {
    return this.apiService.post<ApiResponse<Cliente>>('/clientes', dto);
  }

  actualizarCliente(id: number, dto: ActualizarClienteDto): Observable<ApiResponse<Cliente>> {
    return this.apiService.patch<ApiResponse<Cliente>>(`/clientes/${id}`, dto);
  }

  eliminarCliente(id: number): Observable<any> {
    return this.apiService.delete<any>(`/clientes/${id}`);
  }
}
