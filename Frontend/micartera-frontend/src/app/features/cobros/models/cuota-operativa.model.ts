export type EstadoCuota = 'PENDING' | 'PAID' | 'LATE';

export interface CuotaOperativa {
  cuotaId: number;
  creditoId: number;
  numero: number;
  fechaVenc: string; // ISO
  monto: string;
  saldo: string;

  estado: EstadoCuota;

  pagadoAcumulado: number;
  saldoCuota: number;

  credito: {
    id: number;
    estado: string;
  };

  cliente: {
    id: number;
    nombres: string;
    apellidos: string;
    dni: string;
  };
}
