import { Injectable } from '@nestjs/common';
import { calcularPlanA } from './creditos.calculos';
import { CrearCreditoPlanADto } from './dto/crear-credito-plan-a.dto';
import { fechaLocalFija } from './fecha.util';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class CreditosService {
  constructor(private readonly prisma: PrismaService) {}

  async crearPlanA(dto: CrearCreditoPlanADto) {
    const fechaInicio = fechaLocalFija(dto.fechaInicio, 8);

    const plan = calcularPlanA({
      montoPrestado: dto.montoPrestado,
      cuotaFija: dto.cuotaFija,
      numeroCuotas: dto.numeroCuotas,
      fechaInicio,
      frecuencia: dto.frecuencia,
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.findUnique({
        where: { id: dto.clienteId },
        select: { id: true },
      });
      if (!cliente) throw new Error('Cliente no existe');

      const credito = await tx.credito.create({
        data: {
          clienteId: dto.clienteId,

          montoPrestado: plan.montoPrestado,
          tasaInteresPct: plan.tasaInteresPct,
          totalInteres: plan.totalInteres,
          totalPagar: plan.totalPagar,

          // ✅ Prisma lo exige (campo obligatorio en Credito)
          cuotaBase: plan.cuotaFija,

          frecuencia: plan.frecuencia,
          numeroCuotas: plan.numeroCuotas,
          fechaInicio: plan.fechaInicio,
          fechaCulminacion: plan.fechaCulminacion,

          estado: 'ACTIVE',
        },
      });

      await tx.cuota.createMany({
        data: plan.cuotas.map((c) => ({
          creditoId: credito.id,
          numero: c.numero,
          fechaVenc: c.fechaVenc,
          monto: c.monto,
          saldo: c.saldo,
          estado: 'PENDING',
        })),
      });

      return tx.credito.findUnique({
        where: { id: credito.id },
        include: { cuotas: { orderBy: { numero: 'asc' } } },
      });
    });

    return result;
  }
}
