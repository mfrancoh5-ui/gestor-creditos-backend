import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../db/prisma.service';
import { Env } from '../../config/env';

interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService<Env>,
    private readonly prisma: PrismaService,
  ) {
    const secret = config.get('JWT_SECRET') ?? '';

    // ✅ Falla temprano si falta el secreto (mejor que un bug silencioso)
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en el entorno (.env)');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
    });

    if (!usuario || !usuario.activo) {
      // ✅ Passport interpreta null/false como no autorizado
      throw new UnauthorizedException('Token inválido o usuario inactivo');
    }

    return usuario;
  }
}
