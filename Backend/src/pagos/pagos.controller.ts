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
  BadRequestException,
  DefaultValuePipe,
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
    description:
      'Crea un nuevo pago y actualiza el saldo de la cuota (transacción atómica)',
  })
  @ApiBody({
    type: CrearPagoDto,
    schema: {
      example: {
        // Puede venir cuotaId o creditoId (según su service)
        cuotaId: 1,
        // creditoId: 1,
        monto: 150.5,
        nota: 'Pago realizado en banco',
        fecha: '2026-01-28',
        metodo: 'EFECTIVO',
        referencia: 'ABC123',
        observacion: 'Sin novedad',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Pago registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Monto inválido o datos inválidos' })
  async registrarPago(@Body() dto: CrearPagoDto) {
    return this.pagosService.registrarPago(dto);
  }

  // ✅ LISTADO: por crédito (si viene creditoId) o general paginado (si no viene)
  @Get()
  @Roles('ADMIN', 'COBRADOR', 'VIEWER')
  @ApiOperation({
    summary: 'Listar pagos (general) o por crédito',
    description:
      'Si envía creditoId, lista pagos de ese crédito. Si NO envía creditoId, lista pagos generales paginados con búsqueda opcional (q).',
  })
  @ApiQuery({
    name: 'creditoId',
    required: false,
    type: Number,
    description: 'ID del crédito (opcional). Si se envía, lista por crédito.',
    example: 1,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Página (solo para listado general)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Límite por página (solo para listado general)',
    example: 10,
  })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description:
      'Búsqueda (solo para listado general): cliente, DNI, IDs, nota.',
    example: 'marconi',
  })
  @ApiResponse({ status: 200, description: 'Pagos listados' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  async listar(
    @Query('creditoId') creditoIdRaw?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('q') q?: string,
  ) {
    // Modo A: Por crédito (compatibilidad con su endpoint anterior)
    if (creditoIdRaw !== undefined && creditoIdRaw !== null && creditoIdRaw !== '') {
      const creditoId = Number(creditoIdRaw);
      if (!Number.isFinite(creditoId) || creditoId <= 0) {
        throw new BadRequestException('creditoId inválido');
      }
      return this.pagosService.listarPorCredito(creditoId);
    }

    // Modo B: General paginado
    return this.pagosService.listarGeneral({
      page,
      limit,
      q: q?.trim() || undefined,
    });
  }

  @Get('balance/:creditoId')
  @Roles('ADMIN', 'COBRADOR', 'VIEWER')
  @ApiOperation({
    summary: 'Obtener balance de crédito',
    description:
      'Retorna el balance actual de un crédito (saldo total, saldo vencido, próxima cuota, etc.)',
  })
  @ApiParam({
    name: 'creditoId',
    type: Number,
    description: 'ID del crédito',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Balance obtenido' })
  @ApiResponse({ status: 404, description: 'Crédito no encontrado' })
  async obtenerBalance(@Param('creditoId', ParseIntPipe) creditoId: number) {
    return this.pagosService.obtenerBalance(creditoId);
  }
}
