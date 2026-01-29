import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class CrearPagoDto {
  @ApiPropertyOptional({ example: 10, description: 'ID de la cuota (opcional si se manda creditoId)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  cuotaId?: number;

  @ApiPropertyOptional({ example: 3, description: 'ID del crédito (si no se manda cuotaId, el sistema toma la próxima cuota pendiente)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  creditoId?: number;

  @ApiPropertyOptional({
    example: 150.5,
    description:
      'Monto a pagar. Si NO se envía, el backend toma el saldo exacto de la cuota seleccionada.',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  monto?: number;

  // Fecha opcional (para registrar pago con fecha de operación)
  @ApiPropertyOptional({ example: '2026-01-28', description: 'Fecha de pago YYYY-MM-DD (opcional)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fecha debe ser YYYY-MM-DD' })
  fecha?: string;

  @ApiPropertyOptional({ example: 'EFECTIVO', description: 'Método (opcional, se guardará dentro de nota)' })
  @IsOptional()
  @IsString()
  metodo?: string;

  @ApiPropertyOptional({ example: 'DEP-123', description: 'Referencia (opcional, se guardará dentro de nota)' })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiPropertyOptional({ example: 'Pago realizado en banco', description: 'Observación (opcional, se guardará dentro de nota)' })
  @IsOptional()
  @IsString()
  observacion?: string;

  // Compatibilidad con su campo actual
  @ApiPropertyOptional({ example: 'Pago realizado en banco', description: 'Nota (opcional)' })
  @IsOptional()
  @IsString()
  nota?: string;

  @ApiPropertyOptional({ example: 'Pago realizado', description: 'Alias compatible (opcional)' })
  @IsOptional()
  @IsString()
  comentario?: string;
}
