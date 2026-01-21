import Decimal from 'decimal.js';

export enum FrecuenciaCredito {
  DAILY = 'DAILY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface PlanCuota {
  numero: number; // 1..N
  fechaVenc: Date;
  monto: string; // Decimal como string
  saldo: string; // saldo al inicio de esa cuota (antes de pagar)
}

export interface CalcularPlanAInput {
  montoPrestado: number | string;
  cuotaFija: number | string;
  numeroCuotas: number;
  fechaInicio: Date | string;
  frecuencia: FrecuenciaCredito; // DAILY por defecto
}

export interface CalcularPlanAOutput {
  montoPrestado: string;
  cuotaFija: string;
  numeroCuotas: number;
  frecuencia: FrecuenciaCredito;
  fechaInicio: Date;
  fechaCulminacion: Date;

  totalPagar: string;
  totalInteres: string;
  tasaInteresPct: string; // solo informativa

  cuotas: PlanCuota[];
}

function assertPositivo(d: InstanceType<typeof Decimal>, campo: string) {
  if (!d.isFinite() || d.lessThanOrEqualTo(0)) {
    throw new Error(`${campo} debe ser > 0`);
  }
}

function addFrecuencia(
  base: Date,
  frecuencia: FrecuenciaCredito,
  pasos: number,
): Date {
  const d = new Date(base);

  switch (frecuencia) {
    case FrecuenciaCredito.DAILY:
      d.setDate(d.getDate() + pasos);
      break;

    case FrecuenciaCredito.BIWEEKLY:
      d.setDate(d.getDate() + 15 * pasos);
      break;

    case FrecuenciaCredito.MONTHLY:
      d.setMonth(d.getMonth() + pasos);
      break;

    case FrecuenciaCredito.YEARLY:
      d.setFullYear(d.getFullYear() + pasos);
      break;

    default:
      // defensa empresarial: nunca debería pasar
      throw new Error(`Frecuencia no soportada: ${frecuencia}`);
  }

  return d;
}


export function calcularPlanA(input: CalcularPlanAInput): CalcularPlanAOutput {
  const montoPrestado = new Decimal(input.montoPrestado);
  const cuotaFija = new Decimal(input.cuotaFija);

  if (!Number.isInteger(input.numeroCuotas) || input.numeroCuotas <= 0) {
    throw new Error('numeroCuotas debe ser entero > 0');
  }

  const fechaInicio = new Date(input.fechaInicio);
  if (isNaN(fechaInicio.getTime())) throw new Error('fechaInicio inválida');

  assertPositivo(montoPrestado, 'montoPrestado');
  assertPositivo(cuotaFija, 'cuotaFija');

  const totalPagar = cuotaFija.times(input.numeroCuotas);
  const totalInteres = totalPagar.minus(montoPrestado);

  if (totalInteres.lt(0)) {
    throw new Error(
      'Plan inválido: totalPagar < montoPrestado (interés negativo)',
    );
  }

  const tasaInteresPct = totalInteres.div(montoPrestado).times(100);

  // Plan de cuotas (saldo al inicio de cada cuota)
  const cuotas: PlanCuota[] = [];
  let saldo = totalPagar;

  for (let i = 1; i <= input.numeroCuotas; i++) {
    // La primera cuota vence al siguiente periodo según la frecuencia (i=1)
    const fechaVenc = addFrecuencia(fechaInicio, input.frecuencia, i);

    cuotas.push({
      numero: i,
      fechaVenc,
      monto: cuotaFija.toFixed(2),
      saldo: saldo.toFixed(2),
    });

    saldo = saldo.minus(cuotaFija);
  }

  const fechaCulminacion = cuotas[cuotas.length - 1].fechaVenc;

  return {
    montoPrestado: montoPrestado.toFixed(2),
    cuotaFija: cuotaFija.toFixed(2),
    numeroCuotas: input.numeroCuotas,
    frecuencia: input.frecuencia,
    fechaInicio,
    fechaCulminacion,
    totalPagar: totalPagar.toFixed(2),
    totalInteres: totalInteres.toFixed(2),
    tasaInteresPct: tasaInteresPct.toFixed(2),
    cuotas,
  };
}
