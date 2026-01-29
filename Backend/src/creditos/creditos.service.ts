import { Injectable, NotFoundException } from '@nestjs/common';
import { calcularPlanA } from './creditos.calculos';
import { CrearCreditoPlanADto } from './dto/crear-credito-plan-a.dto';
import { fechaLocalFija } from './fecha.util';
import { PrismaService } from '../db/prisma.service';

type ListarCreditosInput = {
  page: number;
  pageSize: number;
  estado?: string;
  clienteId?: number;
};

type ListarCuotasOperativasInput = {
  estado?: string; // PENDING | PAID (default: PENDING)
  vencidas?: boolean; // true => PENDING y fechaVenc < hoy
  fecha?: string; // YYYY-MM-DD (cuotas del día)
  clienteId?: number;
  creditoId?: number;
  page: number;
  pageSize: number;
};

@Injectable()
export class CreditosService {
  constructor(private readonly prisma: PrismaService) {}

  // =========================
  // LISTAR CUOTAS OPERATIVAS (bandeja/calendario)
  // GET /api/creditos/cuotas?... (ver controller)
  // =========================
  async listarCuotasOperativas(input: ListarCuotasOperativasInput) {
    let { estado, vencidas, fecha, clienteId, creditoId, page, pageSize } =
      input;

    // defaults y límites
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 200) pageSize = 20;

    const skip = (page - 1) * pageSize;

    // default estado
    const estadoFinal = (estado || 'PENDING').toUpperCase();

    const where: any = {
      estado: estadoFinal,
    };

    // filtro directo por crédito
    if (creditoId) where.creditoId = creditoId;

    // filtro por clienteId a través de crédito
    if (clienteId) {
      where.credito = { clienteId };
    }

    // filtro por fecha (día específico)
    if (fecha) {
      // usa util existente: fechaLocalFija, con hora 0 para inicio de día
      const start = fechaLocalFija(fecha, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      where.fechaVenc = { gte: start, lt: end };
    }

    // vencidas=true => PENDING y fechaVenc < inicio de hoy
    if (vencidas) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      where.estado = 'PENDING';
      where.fechaVenc = where.fechaVenc
        ? { ...where.fechaVenc, lt: hoy }
        : { lt: hoy };
    }

    // 1) contar + traer cuotas con contexto (crédito + cliente)
    const [total, cuotas] = await Promise.all([
      this.prisma.cuota.count({ where }),
      this.prisma.cuota.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ fechaVenc: 'asc' }, { numero: 'asc' }],
        select: {
          id: true,
          creditoId: true,
          numero: true,
          fechaVenc: true,
          monto: true,
          saldo: true,
          estado: true,
          credito: {
            select: {
              id: true,
              estado: true,
              // folio: true, // ✅ Si existe en su schema.prisma, descomente.
              cliente: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                  dni: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // 2) sumar pagos por cuotaId (sin incluir pagos[] por cuota)
    const cuotaIds = cuotas.map((q) => q.id);

    const pagosSumMap = new Map<number, number>();

    if (cuotaIds.length) {
      const sums = await this.prisma.pago.groupBy({
        by: ['cuotaId'],
        where: { cuotaId: { in: cuotaIds } },
        _sum: { monto: true },
      });

      for (const s of sums) {
        pagosSumMap.set(s.cuotaId, Number(s._sum.monto || 0));
      }
    }

    // 3) respuesta plana + acumulados
    const data = cuotas.map((q) => {
      const pagadoAcumulado = pagosSumMap.get(q.id) ?? 0;
      const montoCuota = Number(q.monto);
      const saldoCuota = Math.max(0, montoCuota - pagadoAcumulado);

      return {
        cuotaId: q.id,
        creditoId: q.creditoId,
        numero: q.numero,
        fechaVenc: q.fechaVenc,
        monto: q.monto,
        saldo: q.saldo,
        estado: q.estado,

        pagadoAcumulado,
        saldoCuota,

        credito: {
          id: q.credito.id,
          estado: q.credito.estado,
          // folio: q.credito.folio, // ✅ Si existe, descomente también aquí.
        },

        cliente: q.credito.cliente,
      };
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // =========================
  // CREAR PLAN A (YA EXISTÍA)
  // =========================
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

          // ✅ Prisma lo exige
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

  // =========================
  // LISTAR CRÉDITOS (NUEVO)
  // GET /api/creditos?page=1&pageSize=10&estado=ACTIVE&clienteId=1
  // =========================
  async listarPaginado(input: ListarCreditosInput) {
    let { page, pageSize, estado, clienteId } = input;

    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 100) pageSize = 10;

    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (estado) where.estado = estado; // ACTIVE | PAID | LATE | CANCELED
    if (clienteId) where.clienteId = clienteId;

    const [total, creditos] = await Promise.all([
      this.prisma.credito.count({ where }),
      this.prisma.credito.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          cliente: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              dni: true,
              telefono: true,
            },
          },
          cuotas: {
            select: {
              id: true,
              numero: true,
              fechaVenc: true,
              monto: true,
              estado: true,
            },
            orderBy: { numero: 'asc' },
          },
        },
      }),
    ]);

    const items = creditos.map((c) => {
      const cuotas = c.cuotas || [];

      const cuotasPagadas = cuotas.filter((q) => q.estado === 'PAID').length;
      const cuotasPendientes = cuotas.filter((q) => q.estado !== 'PAID').length;

      const prox = cuotas.find((q) => q.estado !== 'PAID') || null;

      return {
        id: c.id,
        estado: c.estado,
        clienteId: c.clienteId,
        cliente: c.cliente,

        montoPrestado: c.montoPrestado,
        cuotaBase: c.cuotaBase,
        tasaInteresPct: c.tasaInteresPct,
        totalInteres: c.totalInteres,
        totalPagar: c.totalPagar,

        frecuencia: c.frecuencia,
        numeroCuotas: c.numeroCuotas,
        fechaInicio: c.fechaInicio,
        fechaCulminacion: c.fechaCulminacion,

        cuotasPagadas,
        cuotasPendientes,

        proxPago: prox
          ? {
              cuotaId: prox.id,
              numero: prox.numero,
              fechaVenc: prox.fechaVenc,
              monto: prox.monto,
              estado: prox.estado,
            }
          : null,
      };
    });

    return {
      data: items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // =========================
  // DETALLE CRÉDITO (NUEVO)
  // GET /api/creditos/:id
  // =========================
  async obtenerDetalle(id: number) {
    const credito = await this.prisma.credito.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            dni: true,
            telefono: true,
            direccion: true,
          },
        },
        cuotas: {
          orderBy: { numero: 'asc' },
          include: {
            pagos: { orderBy: { fechaPago: 'asc' } },
          },
        },
      },
    });

    if (!credito) throw new NotFoundException('Crédito no existe');

    // Calcula acumulados por cuota (UX: mostrar pagado y saldo restante)
    const cuotasConAcumulados = credito.cuotas.map((q) => {
      const pagadoAcumulado = q.pagos.reduce(
        (acc, p) => acc + Number(p.monto),
        0,
      );

      const monto = Number(q.monto);
      const saldoCuota = Math.max(0, monto - pagadoAcumulado);

      return {
        ...q,
        pagadoAcumulado,
        saldoCuota,
      };
    });

    return {
      ...credito,
      cuotas: cuotasConAcumulados,
    };
  }
}
