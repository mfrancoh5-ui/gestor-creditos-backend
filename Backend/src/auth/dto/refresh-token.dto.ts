import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'refreshToken debe ser string' })
  @IsNotEmpty({ message: 'refreshToken es requerido' })
  refreshToken!: string;
}
