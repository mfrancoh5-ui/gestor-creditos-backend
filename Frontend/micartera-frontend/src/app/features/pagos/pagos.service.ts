import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type CrearPagoPayload = {
  cuotaId: number;
  monto: number;
  nota?: string;
  // Si en su DTO también acepta fecha/metodo/referencia/observacion en el futuro,
  // se agregan aquí sin romper nada.
};

export type ListarPagosGeneralParams = {
  page?: number;
  limit?: number;
  q?: string;
};

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly apiUrl: string;

  constructor(private http: HttpClient) {
    // Normaliza: sin slash final
    this.apiUrl = (environment.apiUrl || '').replace(/\/+$/, '');
  }

  /**
   * ✅ Su backend lista pagos por creditoId via querystring: /pagos?creditoId=123
   */
  listarPorCredito(creditoId: number): Observable<any> {
    const id = Number(creditoId);
    const params = new HttpParams().set('creditoId', String(id));
    return this.http.get(`${this.apiUrl}/pagos`, { params });
  }

  /**
   * ✅ (Opcional) Listado general paginado si su controller ya lo soporta:
   * /pagos?page=1&limit=10&q=...
   * Si su backend aún no lo soporta, no lo use en el componente y no pasa nada.
   */
  listarGeneral(params: ListarPagosGeneralParams = {}): Observable<any> {
    let httpParams = new HttpParams();

    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const q = (params.q ?? '').trim();

    httpParams = httpParams.set('page', String(page));
    httpParams = httpParams.set('limit', String(limit));
    if (q) httpParams = httpParams.set('q', q);

    return this.http.get(`${this.apiUrl}/pagos`, { params: httpParams });
  }

  /**
   * ✅ Balance: /pagos/balance/:creditoId
   */
  obtenerBalance(creditoId: number): Observable<any> {
    const id = Number(creditoId);
    return this.http.get(`${this.apiUrl}/pagos/balance/${id}`);
  }

  /**
   * ✅ Registrar pago (por cuotaId)
   */
  registrar(payload: CrearPagoPayload): Observable<any> {
    if (!payload || !Number(payload.cuotaId) || Number(payload.cuotaId) <= 0) {
      throw new Error('cuotaId inválido en CrearPagoPayload');
    }
    if (!Number(payload.monto) || Number(payload.monto) <= 0) {
      throw new Error('monto inválido en CrearPagoPayload');
    }

    return this.http.post(`${this.apiUrl}/pagos`, {
      cuotaId: Number(payload.cuotaId),
      monto: Number(payload.monto),
      nota: payload.nota?.trim() || undefined,
    });
  }
}
