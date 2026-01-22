import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ClientesService, ClientesPaginados } from './clientes.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Cliente } from '@prisma/client';

@ApiTags('Clientes')
@ApiBearerAuth('Bearer')
@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  @Get()
  @Roles('ADMIN', 'COBRADOR', 'VIEWER')
  @ApiOperation({
    summary: 'Listar clientes paginados',
    description: 'Retorna lista de clientes con paginación',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Registros por página (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de clientes',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          items: [
            {
              id: 1,
              nombre: 'Juan Pérez',
              dni: '12345678',
              email: 'juan@example.com',
              telefono: '1234567890',
              direccion: 'Calle 1',
              activo: true,
              createdAt: '2025-01-22T10:00:00.000Z',
            },
          ],
          page: 1,
          pageSize: 10,
          total: 3,
          totalPages: 1,
        },
        message: 'Clientes listados exitosamente',
        timestamp: '2025-01-22T10:45:00.000Z',
        path: '/clientes',
      },
    },
  })
  async lista(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<ClientesPaginados> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize, 10) : 10;
    return this.service.listaPaginada(pageNum, pageSizeNum);
  }

  @Get(':id')
  @Roles('ADMIN', 'COBRADOR', 'VIEWER')
  @ApiOperation({
    summary: 'Obtener cliente por ID',
    description: 'Retorna datos de un cliente específico',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente encontrado',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 1,
          nombre: 'Juan Pérez',
          dni: '12345678',
          email: 'juan@example.com',
          telefono: '1234567890',
          direccion: 'Calle 1',
          activo: true,
          createdAt: '2025-01-22T10:00:00.000Z',
        },
        message: 'Cliente obtenido',
        timestamp: '2025-01-22T10:50:00.000Z',
        path: '/clientes/1',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
    return this.service.obtenerPorId(id);
  }

  @Post()
  @Roles('ADMIN')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Crear nuevo cliente',
    description: 'Crea un nuevo cliente en el sistema (solo ADMIN)',
  })
  @ApiBody({
    type: CrearClienteDto,
    schema: {
      example: {
        nombre: 'Juan Pérez',
        dni: '12345678',
        email: 'juan@example.com',
        telefono: '1234567890',
        direccion: 'Calle 1',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente creado exitosamente',
    schema: {
      example: {
        success: true,
        statusCode: 201,
        data: {
          id: 1,
          nombre: 'Juan Pérez',
          dni: '12345678',
          email: 'juan@example.com',
          telefono: '1234567890',
          direccion: 'Calle 1',
          activo: true,
          createdAt: '2025-01-22T10:55:00.000Z',
        },
        message: 'Cliente creado',
        timestamp: '2025-01-22T10:55:00.000Z',
        path: '/clientes',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'DNI duplicado o datos inválidos',
  })
  async crear(@Body() dto: CrearClienteDto): Promise<Cliente> {
    return this.service.crear(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Actualizar cliente',
    description: 'Actualiza datos de un cliente existente (solo ADMIN)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiBody({
    type: ActualizarClienteDto,
    schema: {
      example: {
        nombre: 'Juan Pérez Actualizado',
        email: 'juan.updated@example.com',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Cliente actualizado',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 1,
          nombre: 'Juan Pérez Actualizado',
          email: 'juan.updated@example.com',
          activo: true,
        },
        message: 'Cliente actualizado',
        timestamp: '2025-01-22T11:00:00.000Z',
        path: '/clientes/1',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarClienteDto,
  ): Promise<Cliente> {
    return this.service.actualizar(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar cliente',
    description: 'Elimina un cliente del sistema (solo ADMIN, no debe tener créditos activos)',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID del cliente',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Cliente eliminado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar cliente con créditos activos',
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async eliminar(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.eliminar(id);
  }
}
