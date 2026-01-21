export type FrecuenciaCredito = 'DAILY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';

export class CrearCreditoDto {
  clienteId!: number;
  montoPrestado!: number;
  tasaInteresPct!: number;

  frecuencia?: FrecuenciaCredito; // default DAILY
  numeroCuotas!: number;

  fechaInicio?: string;
  observacion?: string;
}
