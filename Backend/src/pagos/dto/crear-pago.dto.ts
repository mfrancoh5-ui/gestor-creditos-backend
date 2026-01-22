import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';

export class CrearPagoDto {
  @IsNotEmpty({ message: 'cuotaId es requerido' })
  @IsNumber({}, { message: 'cuotaId debe ser número' })
  cuotaId!: number;

  @IsNotEmpty({ message: 'monto es requerido' })
  @IsPositive({ message: 'monto debe ser > 0' })
  monto!: number;

  @IsOptional()
  nota?: string;
}
