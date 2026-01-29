// ==============================
// Tipos base alineados al backend
// ==============================

export type FrecuenciaCredito =
  | 'DAILY'
  | 'BIWEEKLY'
  | 'MONTHLY'
  | 'YEARLY';

export type EstadoCredito =
  | 'ACTIVE'
  | 'PAID'
  | 'LATE'
  | 'CANCELED';

export type EstadoCuota =
  | 'PENDING'
  | 'PARTIAL'
  | 'PAID'
  | 'LATE';

// ==============================
// Cuota
// ==============================

export interface Cuota {
  id: number;
  creditoId?: number; // opcional para tablas hijas
  numero: number;
  fechaVenc: string; // ISO string
  monto: string;     // Decimal como string
  saldo: string;     // Decimal como string
  estado: EstadoCuota;
}

// ==============================
// Crédito
// ==============================

export interface Credito {
  id: number;
  clienteId: number;

  // Pactado
  montoPrestado: string;
  cuotaBase: string;
  tasaInteresPct: string;

  // Calculado
  totalInteres: string;
  totalPagar: string;

  // Plan
  frecuencia: FrecuenciaCredito;
  numeroCuotas: number;

  fechaInicio: string;       // ISO
  fechaCulminacion: string;  // ISO

  // Estado
  estado: EstadoCredito;
  observacion?: string | null;

  // Relación
  cuotas?: Cuota[];
}
