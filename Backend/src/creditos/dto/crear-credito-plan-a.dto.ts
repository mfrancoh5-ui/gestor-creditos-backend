import { IsDateString, IsEnum, IsInt, IsNumber, Min } from 'class-validator';
import { FrecuenciaCredito } from '../creditos.calculos';

export class CrearCreditoPlanADto {
  @IsInt()
  @Min(1)
  clienteId!: number;

  @IsNumber()
  @Min(0.01)
  montoPrestado!: number;

  @IsNumber()
  @Min(0.01)
  cuotaFija!: number;

  @IsInt()
  @Min(1)
  numeroCuotas!: number;

  @IsEnum(FrecuenciaCredito)
  frecuencia!: FrecuenciaCredito;

  @IsDateString()
  fechaInicio!: string;
}
