import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CuotaOperativa } from '../models/cuota-operativa.model';
import { CobroPayload } from '../models/cobro-payload.model';

@Injectable({ providedIn: 'root' })
export class CobrosService {
  // Normaliza baseUrl: sin slash final
  private readonly baseUrl = (environment.apiUrl || '').replace(/\/+$/, '');
  private readonly creditosUrl = `${this.baseUrl}/creditos`;
  private readonly pagosUrl = `${this.baseUrl}/pagos`;

  constructor(private http: HttpClient) {}

  listarCuotas(params?: {
    fecha?: string;
    vencidas?: boolean;
    page?: number;
    pageSize?: number;
  }): Observable<{ data: CuotaOperativa[] }> {
    let httpParams = new HttpParams();

    if (params?.fecha) httpParams = httpParams.set('fecha', params.fecha);

    // Solo enviar si se solicita explícitamente vencidas=true
    if (params?.vencidas === true) httpParams = httpParams.set('vencidas', 'true');

    if (typeof params?.page === 'number')
      httpParams = httpParams.set('page', String(params.page));

    if (typeof params?.pageSize === 'number')
      httpParams = httpParams.set('pageSize', String(params.pageSize));

    return this.http.get<{ data: CuotaOperativa[] }>(`${this.creditosUrl}/cuotas`, {
      params: httpParams,
    });
  }

  registrarCobro(payload: CobroPayload): Observable<any> {
    return this.http.post(this.pagosUrl, payload);
  }
}
