import { Module } from '@nestjs/common';
import { CreditosController } from './creditos.controller';
import { CreditosService } from './creditos.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [CreditosController],
  providers: [CreditosService, PrismaClient],
})
export class CreditosModule {}
