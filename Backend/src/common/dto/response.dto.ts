import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Código HTTP de la respuesta',
    example: 200,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Datos de la respuesta (puede variar según el endpoint)',
    example: null,
  })
  data?: T;

  @ApiProperty({
    description: 'Mensaje descriptivo de la operación',
    example: 'Operación exitosa',
  })
  message?: string;

  @ApiProperty({
    description: 'Timestamp ISO 8601 de la respuesta',
    example: '2025-01-22T10:30:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Ruta del endpoint solicitado',
    example: '/auth/login',
  })
  path?: string;
}

export class PaginatedResponseDto<T> extends ResponseDto<T[]> {
  @ApiProperty({
    description: 'Total de registros disponibles',
    example: 42,
  })
  total?: number;

  @ApiProperty({
    description: 'Número de página actual',
    example: 1,
  })
  page?: number;

  @ApiProperty({
    description: 'Registros por página',
    example: 10,
  })
  pageSize?: number;

  @ApiProperty({
    description: 'Total de páginas disponibles',
    example: 5,
  })
  totalPages?: number;
}

export class ErrorResponseDto extends ResponseDto<null> {
  @ApiProperty({
    description: 'Errores de validación por campo',
    example: { email: ['Email no válido'], password: ['Contraseña requerida'] },
  })
  errors?: Record<string, string[]>;
}
