import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../db/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Env } from '../config/env';

interface TokenPayload {
  sub: number;
  email: string;
}

export class TokensResponse {
  accessToken!: string;
  refreshToken!: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<Env>,
  ) {}

  async login(dto: LoginDto): Promise<TokensResponse> {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    if (!usuario.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Validar password
    const passwordValid = await bcrypt.compare(
      dto.password,
      usuario.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // Generar tokens
    return this.generateTokens(usuario.id, usuario.email);
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<TokensResponse> {
    try {
      // Validar refresh token
      const payload = this.jwt.verify<TokenPayload>(dto.refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      // Buscar usuario
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!usuario || !usuario.activo) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      // Validar que el hash del refreshToken coincida
      const refreshTokenValid = await bcrypt.compare(
        dto.refreshToken,
        usuario.refreshTokenHash || '',
      );

      if (!refreshTokenValid) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Generar nuevos tokens
      return this.generateTokens(usuario.id, usuario.email);
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private async generateTokens(
    userId: number,
    email: string,
  ): Promise<TokensResponse> {
    const payload: TokenPayload = { sub: userId, email };

    // Access token (corta duración)
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRATION'),
    });

    // Refresh token (larga duración)
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRATION'),
    });

    // Guardar hash del refresh token en BD
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
