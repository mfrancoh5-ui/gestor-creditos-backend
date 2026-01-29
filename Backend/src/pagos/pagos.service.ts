// src/pagos/pagos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { Prisma, Pago, EstadoCuota, EstadoCredito } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PagoResponse {
  pago: Pago;
}

type ListarGeneralParams = {
  page: number;
  limit: number;
  q?: string;
};

@Injectable()
export class PagosService {
  constructor(private readonly prisma: PrismaService) {}

  private buildNota(dto: CrearPagoDto): string | null {
    const partes: string[] = [];

    const notaBase = (dto.nota || dto.comentario || '').trim();
    if (notaBase) partes.push(notaBase);

    const metodo = (dto.metodo || '').trim();
    const referencia = (dto.referencia || '').trim();
    const obs = (dto.observacion || '').trim();

    if (metodo) partes.push(`Método: ${metodo}`);
    if (referencia) partes.push(`Ref: ${referencia}`);
    if (obs) partes.push(`Obs: ${obs}`);

    const final = partes.join(' | ').trim();
    return final.length ? final : null;
  }

  private parseFechaPago(dto: CrearPagoDto): Date | undefined {
    if (!dto.fecha) return undefined;
    const [y, m, d] = dto.fecha.split('-').map((x) => Number(x));
    const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
    if (Number.isNaN(dt.getTime())) return undefined;
    return dt;
  }

  /**
   * ✅ OPCIÓN A (backend-first):
   * Devuelve la próxima cuota cobrable del crédito, y el monto exacto a cobrar (saldo actual).
   * Regla:
   * - Solo créditos ACTIVE/LATE (no PAID/CANCELED)
   * - Cuota "cobrable": estado IN (PENDING, PARTIAL, LATE) y orden por fechaVenc asc, numero asc
   */
  async obtenerProximaCuota(creditoId: number) {
    if (!creditoId || creditoId <= 0) {
      throw new BadRequestException('creditoId inválido');
    }

    const credito = await this.prisma.credito.findUnique({
      where: { id: creditoId },
      select: { id: true, estado: true, clienteId: true },
    });

    if (!credito) {
      throw new NotFoundException(`Crédito con ID ${creditoId} no encontrado`);
    }

    if (credito.estado === 'PAID' || credito.estado === 'CANCELED') {
      throw new BadRequestException(
        `Crédito en estado ${credito.estado}. No tiene cuota cobrable.`,
      );
    }

    const cuota = await this.prisma.cuota.findFirst({
      where: {
        creditoId,
        estado: { in: ['PENDING', 'PARTIAL', 'LATE'] },
      },
      orderBy: [{ fechaVenc: 'asc' }, { numero: 'asc' }],
      select: {
        id: true,
        creditoId: true,
        numero: true,
        fechaVenc: true,
        monto: true,
        saldo: true,
        estado: true,
      },
    });

    if (!cuota) {
      throw new BadRequestException(
        'Este crédito no tiene cuotas pendientes para cobrar',
      );
    }

    return {
      creditoId,
      cuotaId: cuota.id,
      numero: cuota.numero,
      fechaVenc: cuota.fechaVenc,
      montoCuota: cuota.monto,
      saldoCuota: cuota.saldo,
      estadoCuota: cuota.estado,
      montoSugerido: cuota.saldo, // ✅ cobro exacto por default
    };
  }

  private async resolverCuota(dto: CrearPagoDto) {
    if (dto.cuotaId && dto.cuotaId > 0) {
      const cuota = await this.prisma.cuota.findUnique({
        where: { id: dto.cuotaId },
        include: { credito: true },
      });
      if (!cuota) {
        throw new NotFoundException(
          `Cuota con ID ${dto.cuotaId} no encontrada`,
        );
      }
      return cuota;
    }

    if (!dto.creditoId || dto.creditoId <= 0) {
      throw new BadRequestException('Debe enviar cuotaId o creditoId');
    }

    const credito = await this.prisma.credito.findUnique({
      where: { id: dto.creditoId },
      select: { id: true, estado: true },
    });
    if (!credito) {
      throw new NotFoundException(
        `Crédito con ID ${dto.creditoId} no encontrado`,
      );
    }

    if (credito.estado === 'PAID' || credito.estado === 'CANCELED') {
      throw new BadRequestException(
        `No se puede registrar pago para crédito en estado ${credito.estado}`,
      );
    }

    const cuota = await this.prisma.cuota.findFirst({
      where: {
        creditoId: dto.creditoId,
        estado: { in: ['PENDING', 'PARTIAL', 'LATE'] },
      },
      orderBy: [{ fechaVenc: 'asc' }, { numero: 'asc' }],
      include: { credito: true },
    });

    if (!cuota) {
      throw new BadRequestException(
        'Este crédito no tiene cuotas pendientes para cobrar',
      );
    }

    return cuota;
  }

  async registrarPago(dto: CrearPagoDto): Promise<PagoResponse> {
    const cuota = await this.resolverCuota(dto);

    const credito = await this.prisma.credito.findUnique({
      where: { id: cuota.creditoId },
      include: { cuotas: true },
    });

    if (!credito) {
      throw new NotFoundException(
        `Crédito con ID ${cuota.creditoId} no encontrado`,
      );
    }

    if (credito.estado === 'PAID' || credito.estado === 'CANCELED') {
      throw new BadRequestException(
        `No se puede registrar pago para crédito en estado ${credito.estado}`,
      );
    }

    const monto =
      dto.monto == null ? cuota.saldo : new Decimal(String(dto.monto));

    if (monto.lte(0)) {
      throw new BadRequestException('monto debe ser > 0');
    }

    if (monto.greaterThan(cuota.saldo)) {
      throw new BadRequestException(
        `Pago de ${monto} excede el saldo de la cuota (${cuota.saldo})`,
      );
    }

    const nota = this.buildNota(dto);
    const fechaPago = this.parseFechaPago(dto);

    const result = await this.prisma.$transaction(async (tx) => {
      const pago = await tx.pago.create({
        data: {
          cuotaId: cuota.id,
          monto,
          nota,
          ...(fechaPago ? { fechaPago } : {}),
        },
      });

      const nuevoSaldo = cuota.saldo.minus(monto);

      let nuevoEstadoCuota: EstadoCuota = cuota.estado;

      if (nuevoSaldo.equals(0)) nuevoEstadoCuota = 'PAID';
      else if (nuevoSaldo.greaterThan(0) && nuevoSaldo.lessThan(cuota.monto))
        nuevoEstadoCuota = 'PARTIAL';
      else if (nuevoSaldo.greaterThan(0) && cuota.fechaVenc < new Date())
        nuevoEstadoCuota = 'LATE';
      else nuevoEstadoCuota = 'PENDING';

      await tx.cuota.update({
        where: { id: cuota.id },
        data: { saldo: nuevoSaldo, estado: nuevoEstadoCuota },
      });

      const cuotasActualizadas = await tx.cuota.findMany({
        where: { creditoId: credito.id },
        select: { estado: true, fechaVenc: true },
      });

      const ahora = new Date();

      const todasPagadas = cuotasActualizadas.every((c) => c.estado === 'PAID');

      const hayMora = cuotasActualizadas.some(
        (c) =>
          c.estado === 'LATE' || (c.fechaVenc < ahora && c.estado !== 'PAID'),
      );

      let nuevoEstadoCredito: EstadoCredito;
      if (todasPagadas) nuevoEstadoCredito = 'PAID';
      else if (hayMora) nuevoEstadoCredito = 'LATE';
      else nuevoEstadoCredito = 'ACTIVE';

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
    const credito = await this.prisma.credito.findUnique({
      where: { id: creditoId },
      select: { id: true },
    });
    if (!credito) {
      throw new NotFoundException(`Crédito con ID ${creditoId} no encontrado`);
    }

    return this.prisma.pago.findMany({
      where: { cuota: { creditoId } },
      orderBy: { fechaPago: 'desc' },
    });
  }

  async listarGeneral(params: ListarGeneralParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const q = String(params.q || '').trim();
    const skip = (page - 1) * limit;

    const qNum = /^\d+$/.test(q) ? Number(q) : null;

    const or: Prisma.PagoWhereInput[] = [];

    if (q.length > 0) {
      or.push({ nota: { contains: q } });
      or.push({
        cuota: { credito: { cliente: { nombres: { contains: q } } } },
      });
      or.push({
        cuota: { credito: { cliente: { apellidos: { contains: q } } } },
      });
      or.push({ cuota: { credito: { cliente: { dni: { contains: q } } } } });

      if (qNum) {
        or.push({ id: qNum });
        or.push({ cuotaId: qNum });
        or.push({ cuota: { creditoId: qNum } });
      }
    }

    const where: Prisma.PagoWhereInput | undefined = or.length
      ? { OR: or }
      : undefined;

    const [total, data] = await this.prisma.$transaction([
      this.prisma.pago.count({ where }),
      this.prisma.pago.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaPago: 'desc' },
        include: {
          cuota: {
            include: {
              credito: {
                include: { cliente: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
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

    const saldoTotal = credito.cuotas.reduce(
      (sum, c) => sum.plus(c.saldo),
      new Decimal(0),
    );

    const saldoVencido = credito.cuotas
      .filter((c) => c.fechaVenc < ahora && c.estado !== 'PAID')
      .reduce((sum, c) => sum.plus(c.saldo), new Decimal(0));

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
      proximaVencimiento: proximaCuota?.fechaVenc
        ? proximaCuota.fechaVenc.toISOString().split('T')[0]
        : undefined,
      cuotasPendientes,
      cuotasVencidas,
      estado: credito.estado,
    };
  }
}
