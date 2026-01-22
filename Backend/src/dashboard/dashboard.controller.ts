import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth('Bearer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @Roles('ADMIN', 'VIEWER')
  @ApiOperation({
    summary: 'Obtener KPIs del dashboard',
    description: 'Retorna 5 métricas clave: clientes, créditos activos, cartera vencida, monto cobrado, cuotas pendientes',
  })
  @ApiResponse({
    status: 200,
    description: 'KPIs obtenidos',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          totalClientes: 3,
          creditosActivos: 2,
          carteraVencida: 5000.75,
          montoCobradoMes: 15000.5,
          cuotasPendientes: 12,
        },
        message: 'KPIs obtenidos',
        timestamp: '2025-01-22T11:20:00.000Z',
        path: '/dashboard/kpis',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado (solo ADMIN y VIEWER)',
  })
  async obtenerKPIs() {
    return this.dashboardService.obtenerKPIs();
  }
}
