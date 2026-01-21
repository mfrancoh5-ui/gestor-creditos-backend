import { calcularPlanA, FrecuenciaCredito } from './creditos.calculos';

const frecuencia: FrecuenciaCredito = FrecuenciaCredito.DAILY;

calcularPlanA({
  montoPrestado: 1000,
  cuotaFija: 250,
  numeroCuotas: 5,
  fechaInicio: new Date(),
  frecuencia,
});
