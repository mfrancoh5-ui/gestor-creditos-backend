import { Body, Controller, Get, Post, UseGuards, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService, TokensResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { Usuario, Rol } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica con email y contraseña, retorna access_token y refresh_token',
  })
  @ApiBody({
    type: LoginDto,
    schema: {
      example: {
        email: 'admin@gestor-creditos.local',
        password: 'admin123',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: { id: 1, email: 'admin@gestor-creditos.local', rol: 'ADMIN' },
        },
        message: 'Login exitoso',
        timestamp: '2025-01-22T10:30:00.000Z',
        path: '/auth/login',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email o contraseña incorrecta',
  })
  async login(@Body() dto: LoginDto): Promise<TokensResponse> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Refrescar token',
    description: 'Usa refresh_token para obtener nuevo access_token',
  })
  @ApiBody({
    type: RefreshTokenDto,
    schema: {
      example: {
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        message: 'Token refrescado',
        timestamp: '2025-01-22T10:35:00.000Z',
        path: '/auth/refresh',
      },
    },
  })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokensResponse> {
    return this.authService.refreshTokens(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.ADMIN, Rol.COBRADOR, Rol.VIEWER)
  @ApiBearerAuth('Bearer')
  @ApiOperation({
    summary: 'Obtener usuario actual',
    description: 'Retorna datos del usuario autenticado (requiere JWT)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actual',
    schema: {
      example: {
        success: true,
        statusCode: 200,
        data: {
          id: 1,
          email: 'admin@gestor-creditos.local',
          rol: 'ADMIN',
        },
        message: 'Usuario actual',
        timestamp: '2025-01-22T10:40:00.000Z',
        path: '/auth/me',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token no válido o expirado' })
  async getCurrentUser(@CurrentUser() usuario: Usuario) {
    const { passwordHash, refreshTokenHash, ...userWithoutSensitive } = usuario;
    return userWithoutSensitive;
  }
}
