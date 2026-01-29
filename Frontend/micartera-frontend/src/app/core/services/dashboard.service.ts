import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { DashboardStats, ApiResponse } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  // ⚠️ Si este endpoint no existe en backend, lo ajustamos luego.
  // En logs vimos /dashboard/kpis, no /dashboard/estadisticas
  obtenerEstadisticas(): Observable<ApiResponse<DashboardStats>> {
    return this.apiService.get<ApiResponse<DashboardStats>>('/dashboard/kpis');
  }

  // ✅ Este era el 404. En backend existe /dashboard/kpis.
  obtenerResumen(): Observable<
    ApiResponse<{
      totalClientes: number;
      creditosActivos: number;
      montoDesembolsado: number;
      recaudacionMes: number;
      morosidad: number;
    }>
  > {
    return this.apiService.get<
      ApiResponse<{
        totalClientes: number;
        creditosActivos: number;
        montoDesembolsado: number;
        recaudacionMes: number;
        morosidad: number;
      }>
    >('/dashboard/kpis');
  }

  // ⚠️ Si no existe, lo ajustamos cuando revisemos logs/rutas reales.
  obtenerIndicadores(): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>('/dashboard/kpis');
  }

  // ⚠️ Igual: puede que no exista. Lo dejamos pero si da 404 lo alineamos.
  obtenerCreditosPorEstado(): Observable<
    ApiResponse<
      {
        estado: string;
        cantidad: number;
        monto: number;
      }[]
    >
  > {
    return this.apiService.get<
      ApiResponse<
        {
          estado: string;
          cantidad: number;
          monto: number;
        }[]
      >
    >('/dashboard/creditos-por-estado');
  }
}
