import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import { CrearPagoDto } from './dto/crear-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Pagos')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar pago',
    description: 'Crea un nuevo pago y actualiza el saldo de la cuota (transacción atómica)',
  })
  @ApiBody({
    type: CrearPagoDto,
    schema: {
      example: {
        cuotaId: 1,
        monto: 150.5,
        nota: 'Pago realizado en banco',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado exitosamente',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: 1,
          cuotaId: 1,
          monto: 150.5,
          nota: 'Pago realizado en banco',
          fecha: '2025-01-22T11:05:00.000Z',
        },
        message: 'Pago registrado',
        timestamp: '2025-01-22T11:05:00.000Z',
        path: '/pagos',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Monto inválido o cuota no encontrada',
  })
  async registrarPago(@Body() dto: CrearPagoDto) {
    return this.pagosService.registrarPago(dto);
  }

  @Get()
  @Roles('ADMIN', 'COBRADOR', 'VIEWER')
  @ApiOperation({
    summary: 'Listar pagos por crédito',
    description: 'Obtiene todos los pagos registrados para un crédito específico',
  })
  @ApiQuery({
    name: 'creditoId',
    type: 'number',
    description: 'ID del crédito',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Pagos listados',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: [
          {
            id: 1,
            cuotaId: 1,
            monto: 150.5,
            nota: 'Pago realizado',
            fecha: '2025-01-22T11:05:00.000Z',
          },
        ],
        message: 'Pagos listados',
        timestamp: '2025-01-22T11:10:00.000Z',
        path: '/pagos?creditoId=1',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'creditoId inválido o no proporcionado',
  })
  async listarPorCredito(@Query('creditoId', ParseIntPipe) creditoId: number) {
    return this.pagosService.listarPorCredito(creditoId);
  }

  @Get('balance/:creditoId')
  @Roles('ADMIN', 'COBRADOR', 'VIEWER')
  @ApiOperation({
    summary: 'Obtener balance de crédito',
    description: 'Retorna el balance actual de un crédito (saldo pagado, pendiente, etc)',
  })
  @ApiParam({
    name: 'creditoId',
    type: 'number',
    description: 'ID del crédito',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Balance obtenido',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          creditoId: 1,
          montoPrincipal: 5000,
          montoPagado: 1500,
          montoPendiente: 3500,
          porcentajePago: 30,
        },
        message: 'Balance obtenido',
        timestamp: '2025-01-22T11:15:00.000Z',
        path: '/pagos/balance/1',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Crédito no encontrado',
  })
  async obtenerBalance(@Param('creditoId', ParseIntPipe) creditoId: number) {
    return this.pagosService.obtenerBalance(creditoId);
  }
}
