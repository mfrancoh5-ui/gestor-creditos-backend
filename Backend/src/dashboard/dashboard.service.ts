import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface DashboardKPIs {
  totalClientes: number;
  creditosActivos: number;
  carteraVencida: number | Decimal;
  montoCobradoMes: number | Decimal;
  cuotasPendientes: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async obtenerKPIs(): Promise<DashboardKPIs> {
    // 1. Total de clientes
    const totalClientes = await this.prisma.cliente.count();

    // 2. Créditos activos
    const creditosActivos = await this.prisma.credito.count({
      where: { estado: 'ACTIVE' },
    });

    // 3. Cartera vencida (suma de saldos de cuotas vencidas)
    const ahora = new Date();
    const carteraVencida = await this.prisma.cuota.aggregate({
      where: {
        AND: [
          { fechaVenc: { lt: ahora } },
          { estado: { not: 'PAID' } },
        ],
      },
      _sum: { saldo: true },
    });

    // 4. Monto cobrado en el mes actual
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);

    const montoCobradoMes = await this.prisma.pago.aggregate({
      where: {
        fechaPago: {
          gte: inicioMes,
          lte: finMes,
        },
      },
      _sum: { monto: true },
    });

    // 5. Cuotas pendientes (no pagadas)
    const cuotasPendientes = await this.prisma.cuota.count({
      where: { estado: { not: 'PAID' } },
    });

    return {
      totalClientes,
      creditosActivos,
      carteraVencida: carteraVencida._sum.saldo ?? 0,
      montoCobradoMes: montoCobradoMes._sum.monto ?? 0,
      cuotasPendientes,
    };
  }
}
