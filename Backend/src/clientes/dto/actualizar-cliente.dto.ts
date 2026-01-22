import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ActualizarClienteDto {
  @IsOptional()
  @IsString({ message: 'Nombres debe ser string' })
  @MaxLength(120, { message: 'Nombres máximo 120 caracteres' })
  nombres?: string;

  @IsOptional()
  @IsString({ message: 'Apellidos debe ser string' })
  @MaxLength(120, { message: 'Apellidos máximo 120 caracteres' })
  apellidos?: string;

  @IsOptional()
  @IsString({ message: 'Teléfono debe ser string' })
  @MaxLength(30, { message: 'Teléfono máximo 30 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'DNI debe ser string' })
  @MaxLength(30, { message: 'DNI máximo 30 caracteres' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'Dirección debe ser string' })
  @MaxLength(255, { message: 'Dirección máximo 255 caracteres' })
  direccion?: string;
}
