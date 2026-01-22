import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { Cliente } from '@prisma/client';

export interface ClientesPaginados {
  data: Cliente[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async listaPaginada(
    page: number = 1,
    pageSize: number = 10,
  ): Promise<ClientesPaginados> {
    // Validar parámetros
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 100) pageSize = 10;

    const skip = (page - 1) * pageSize;

    // Contar total
    const total = await this.prisma.cliente.count();

    // Obtener datos con paginación
    const data = await this.prisma.cliente.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(total / pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async obtenerPorId(id: number): Promise<Cliente> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return cliente;
  }

  async crear(dto: CrearClienteDto): Promise<Cliente> {
    // Validar DNI único si es proporcionado
    if (dto.dni) {
      const existente = await this.prisma.cliente.findUnique({
        where: { dni: dto.dni },
      });

      if (existente) {
        throw new BadRequestException(`DNI ${dto.dni} ya está registrado`);
      }
    }

    const cliente = await this.prisma.cliente.create({
      data: {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        telefono: dto.telefono,
        dni: dto.dni,
        direccion: dto.direccion,
      },
    });

    return cliente;
  }

  async actualizar(
    id: number,
    dto: ActualizarClienteDto,
  ): Promise<Cliente> {
    // Verificar que el cliente existe
    await this.obtenerPorId(id);

    // Validar DNI único si se intenta cambiar
    if (dto.dni) {
      const existente = await this.prisma.cliente.findUnique({
        where: { dni: dto.dni },
      });

      if (existente && existente.id !== id) {
        throw new BadRequestException(`DNI ${dto.dni} ya está registrado`);
      }
    }

    const cliente = await this.prisma.cliente.update({
      where: { id },
      data: {
        ...(dto.nombres && { nombres: dto.nombres }),
        ...(dto.apellidos && { apellidos: dto.apellidos }),
        ...(dto.telefono !== undefined && { telefono: dto.telefono }),
        ...(dto.dni !== undefined && { dni: dto.dni }),
        ...(dto.direccion !== undefined && { direccion: dto.direccion }),
      },
    });

    return cliente;
  }

  async eliminar(id: number): Promise<void> {
    // Verificar que el cliente existe
    await this.obtenerPorId(id);

    // Verificar si tiene créditos activos
    const creditosActivos = await this.prisma.credito.count({
      where: {
        clienteId: id,
        estado: 'ACTIVE',
      },
    });

    if (creditosActivos > 0) {
      throw new BadRequestException(
        'No se puede eliminar cliente con créditos activos',
      );
    }

    await this.prisma.cliente.delete({
      where: { id },
    });
  }
}
