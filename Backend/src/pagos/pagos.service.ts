import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { Pago } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PagoResponse {
  pago: Pago;
}

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  async registrarPago(dto: CrearPagoDto): Promise<PagoResponse> {
    // Validar cuota existe e incluir crédito para validaciones
    const cuota = await this.prisma.cuota.findUnique({
      where: { id: dto.cuotaId },
      include: {
        credito: {
          include: { cuotas: { orderBy: { numero: 'asc' } } },
        },
      },
    });

    if (!cuota) {
      throw new NotFoundException(`Cuota con ID ${dto.cuotaId} no encontrada`);
    }

    const credito = cuota.credito;

    if (credito.estado === 'PAID' || credito.estado === 'CANCELED') {
      throw new BadRequestException(
        `No se puede registrar pago para crédito en estado ${credito.estado}`,
      );
    }

    // Convertir monto a Decimal para precisión
    const monto = new Decimal(dto.monto.toString());

    if (monto.greaterThan(cuota.saldo)) {
      throw new BadRequestException(
        `Pago de ${monto} excede el saldo de la cuota (${cuota.saldo})`,
      );
    }

    // TRANSACCIÓN ATÓMICA
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Crear pago
      const pago = await tx.pago.create({
        data: {
          cuotaId: dto.cuotaId,
          monto,
          nota: dto.nota,
        },
      });

      // 2. Actualizar saldo de cuota
      const nuevoSaldo = cuota.saldo.minus(monto);

      let nuevoEstado = cuota.estado;

      // Determinar nuevo estado de cuota
      if (nuevoSaldo.equals(0)) {
        nuevoEstado = 'PAID';
      } else if (nuevoSaldo.greaterThan(0) && nuevoSaldo.lessThan(cuota.monto)) {
        nuevoEstado = 'PARTIAL';
      }

      await tx.cuota.update({
        where: { id: dto.cuotaId },
        data: {
          saldo: nuevoSaldo,
          estado: nuevoEstado,
        },
      });

      // 3. Recalcular estado del crédito basado en cuotas
      const cuotasActualizadas = await tx.cuota.findMany({
        where: { creditoId: credito.id },
      });

      let nuevoEstadoCredito = credito.estado;

      const tieneVencidas = cuotasActualizadas.some(
        (c) => c.estado === 'LATE' || c.estado === 'PARTIAL',
      );
      const todasPagadas = cuotasActualizadas.every((c) => c.estado === 'PAID');

      if (todasPagadas) {
        nuevoEstadoCredito = 'PAID';
      } else if (tieneVencidas) {
        nuevoEstadoCredito = 'LATE';
      }

      // Actualizar estado del crédito
      if (nuevoEstadoCredito !== credito.estado) {
        await tx.credito.update({
          where: { id: credito.id },
          data: { estado: nuevoEstadoCredito },
        });
      }

      return { pago };
    });

    return result;
  }

  async listarPorCredito(creditoId: number): Promise<Pago[]> {
    // Verificar que el crédito existe
    const credito = await this.prisma.credito.findUnique({
      where: { id: creditoId },
    });

    if (!credito) {
      throw new NotFoundException(`Crédito con ID ${creditoId} no encontrado`);
    }

    const pagos = await this.prisma.pago.findMany({
      where: { cuota: { creditoId } },
      orderBy: { fechaPago: 'desc' },
    });

    return pagos;
  }

  async obtenerBalance(creditoId: number) {
    const credito = await this.prisma.credito.findUnique({
      where: { id: creditoId },
      include: { cuotas: true },
    });

    if (!credito) {
      throw new NotFoundException(`Crédito con ID ${creditoId} no encontrado`);
    }

    const ahora = new Date();

    // Calcular saldos
    const saldoTotal = credito.cuotas.reduce(
      (sum, c) => sum.plus(c.saldo),
      new Decimal(0),
    );

    const saldoVencido = credito.cuotas
      .filter((c) => c.fechaVenc < ahora && c.estado !== 'PAID')
      .reduce((sum, c) => sum.plus(c.saldo), new Decimal(0));

    // Próxima vencimiento
    const proximaCuota = credito.cuotas
      .filter((c) => c.estado !== 'PAID')
      .sort((a, b) => a.fechaVenc.getTime() - b.fechaVenc.getTime())[0];

    const cuotasPendientes = credito.cuotas.filter((c) => c.estado !== 'PAID')
      .length;
    const cuotasVencidas = credito.cuotas.filter(
      (c) => c.estado === 'LATE' || (c.fechaVenc < ahora && c.estado !== 'PAID'),
    ).length;

    return {
      creditoId,
      saldoTotal: saldoTotal.toNumber(),
      saldoVencido: saldoVencido.toNumber(),
      proximaVencimiento: proximaCuota?.fechaVenc.toISOString().split('T')[0],
      cuotasPendientes,
      cuotasVencidas,
      estado: credito.estado,
    };
  }
}
