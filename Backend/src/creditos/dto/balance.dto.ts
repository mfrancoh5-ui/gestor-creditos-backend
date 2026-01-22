import { Decimal } from '@prisma/client/runtime/library';
import { EstadoCredito } from '@prisma/client';

export class BalanceDto {
  creditoId!: number;
  saldoTotal!: number | Decimal;
  saldoVencido!: number | Decimal;
  proximaVencimiento?: string;
  cuotasPendientes!: number;
  cuotasVencidas!: number;
  estado!: EstadoCredito;
}
