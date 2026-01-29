export interface CobroPayload {
  cuotaId: number;
  monto: number;
  fechaPago: string; // YYYY-MM-DD
  nota?: string;
}
